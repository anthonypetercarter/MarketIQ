/**
 * SEC EDGAR — genuinely free, no account, no API key. The only real
 * requirement is a real, identifying User-Agent per SEC's fair-access
 * policy — see EDGAR_USER_AGENT in .env. This is the primary-source
 * fundamentals gap this project has had since the original MVP spec:
 * every real Opportunity so far has come from web search headlines, never
 * an actual 10-K or 10-Q.
 *
 * Two real SEC endpoints used here:
 * - company_tickers.json — free, public ticker-to-CIK mapping (SEC
 *   identifies companies by CIK, not ticker).
 * - data.sec.gov/api/xbrl/companyfacts/CIK{10-digit}.json — real XBRL
 *   financial data extracted from actual filed 10-Ks/10-Qs.
 */

const SEC_USER_AGENT = process.env.EDGAR_USER_AGENT;

function requireUserAgent(): string {
  if (!SEC_USER_AGENT) {
    throw new Error(
      "EDGAR_USER_AGENT must be set in .env — SEC's fair-access policy requires a real, " +
        'identifying User-Agent (e.g. "MarketIQ your-email@example.com"), not authentication.',
    );
  }
  return SEC_USER_AGENT;
}

interface TickerEntry {
  cik_str: number;
  ticker: string;
  title: string;
}

/**
 * Looks up a company's real CIK from its ticker, using SEC's own free,
 * public mapping file. Returns the CIK zero-padded to 10 digits, the
 * format the companyfacts endpoint expects.
 */
export async function lookupCik(ticker: string): Promise<string | null> {
  const response = await fetch("https://www.sec.gov/files/company_tickers.json", {
    headers: { "User-Agent": requireUserAgent() },
  });
  if (!response.ok) {
    throw new Error(`SEC company_tickers.json request failed: ${response.status}`);
  }
  const data = (await response.json()) as Record<string, TickerEntry>;

  const upperTicker = ticker.toUpperCase();
  for (const entry of Object.values(data)) {
    if (entry.ticker.toUpperCase() === upperTicker) {
      return String(entry.cik_str).padStart(10, "0");
    }
  }
  return null;
}

/** Raw shape of a single XBRL fact's real value, as SEC actually returns it. */
interface XbrlFactValue {
  end: string;
  val: number;
  fy: number;
  fp: string;
  form: string;
  filed: string;
}

interface XbrlConcept {
  units: {
    USD?: XbrlFactValue[];
  };
}

interface CompanyFactsResponse {
  cik: number;
  entityName: string;
  facts: {
    "us-gaap"?: Record<string, XbrlConcept>;
  };
}

/**
 * Fetches a company's real, complete XBRL financial data — every fact
 * extracted from every filed 10-K/10-Q. No caching here; caller decides
 * how often this needs refreshing (financial statements don't change
 * intraday the way a stock price does).
 */
export async function fetchCompanyFacts(cik: string): Promise<CompanyFactsResponse> {
  const response = await fetch(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, {
    headers: { "User-Agent": requireUserAgent() },
  });
  if (!response.ok) {
    throw new Error(`SEC companyfacts request failed for CIK ${cik}: ${response.status}`);
  }
  return (await response.json()) as CompanyFactsResponse;
}

interface FactSummary {
  value: number;
  fiscalYear: number;
  fiscalPeriod: string;
  form: string;
  filedDate: string;
}

export interface KeyFundamentals {
  entityName: string;
  /** Most recent real revenue figure found, with its real filing context. */
  revenue: FactSummary | null;
  netIncome: FactSummary | null;
  totalAssets: FactSummary | null;
}

/**
 * Real companies use inconsistent XBRL tags for the same real concept —
 * "Revenues" for some, "RevenueFromContractWithCustomerExcludingAssessedTax"
 * for others (a genuine, documented XBRL taxonomy quirk, not a bug in this
 * code). Tries each real tag in order and uses whichever one the company
 * actually reported, rather than assuming one canonical tag exists.
 */
const REVENUE_TAGS = [
  "Revenues",
  "RevenueFromContractWithCustomerExcludingAssessedTax",
  "RevenueFromContractWithCustomerIncludingAssessedTax",
];
const NET_INCOME_TAGS = ["NetIncomeLoss"];
const TOTAL_ASSETS_TAGS = ["Assets"];

function mostRecentFact(concept: XbrlConcept | undefined): FactSummary | null {
  const values = concept?.units.USD;
  if (!values || values.length === 0) return null;

  // Real filings can arrive out of chronological order in this array —
  // sort by real filing date to find what's genuinely most recent.
  const sorted = [...values].sort((a, b) => (a.filed < b.filed ? 1 : -1));
  const latest = sorted[0];
  return {
    value: latest.val,
    fiscalYear: latest.fy,
    fiscalPeriod: latest.fp,
    form: latest.form,
    filedDate: latest.filed,
  };
}

/**
 * Real companies sometimes report a concept under more than one tag over
 * their history — Apple's real filings, for example, used "Revenues"
 * through 2018, then switched to
 * "RevenueFromContractWithCustomerExcludingAssessedTax" after adopting
 * ASC 606. Checking tags in order and stopping at the first one with ANY
 * data would silently return a stale 2018 figure while a much more recent
 * value sits under the newer tag. Instead, this checks the most recent
 * value under EVERY known tag, then picks the single most recent one
 * across all of them by real filed date.
 */
function mostRecentAcrossTags(
  facts: Record<string, XbrlConcept> | undefined,
  tags: string[],
): FactSummary | null {
  if (!facts) return null;

  const candidates: FactSummary[] = [];
  for (const tag of tags) {
    const result = mostRecentFact(facts[tag]);
    if (result) candidates.push(result);
  }
  if (candidates.length === 0) return null;

  candidates.sort((a, b) => (a.filedDate < b.filedDate ? 1 : -1));
  return candidates[0];
}

/**
 * Pure function: extracts a small, real, useful set of fundamentals from
 * SEC's real (large, deeply nested) company facts response. Never invents
 * a figure — returns null for anything the company's real filings didn't
 * report under any of the known tag variants, rather than guessing.
 */
export function extractKeyFundamentals(companyFacts: CompanyFactsResponse): KeyFundamentals {
  const gaapFacts = companyFacts.facts["us-gaap"];
  return {
    entityName: companyFacts.entityName,
    revenue: mostRecentAcrossTags(gaapFacts, REVENUE_TAGS),
    netIncome: mostRecentAcrossTags(gaapFacts, NET_INCOME_TAGS),
    totalAssets: mostRecentAcrossTags(gaapFacts, TOTAL_ASSETS_TAGS),
  };
}
