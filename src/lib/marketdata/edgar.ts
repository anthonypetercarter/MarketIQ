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

/**
 * The reverse of lookupCik — Frame data (used by the Quality, Growth, and
 * Value screens) only carries a real, plain-number CIK, never a ticker.
 * Fetches the same real, free mapping file once and builds the full
 * reverse map, rather than looking up one ticker at a time.
 *
 * A real, genuine bug this function had until recently: SEC's own file
 * lists every real, registered security a company has under the same
 * CIK — common stock, preferred shares, notes, warrants — and naively
 * calling `.set()` in a loop meant whichever entry happened to come LAST
 * in the raw JSON silently won, with zero regard for which one was
 * actually common stock. A live discovery from the Value screen's own
 * real output, not a hypothetical: `KKRS` (a KKR preferred series) and
 * `SOJD` (a Southern Company junior subordinated note) both ended up
 * mapped instead of the real common tickers (`KKR`, `SO`).
 *
 * The first real fix attempted — preferring whichever entry's `title`
 * didn't look like a non-common security — was itself a real dead end,
 * confirmed directly against SEC's live data: the title field is
 * identical across every one of a company's real securities ("KKR & Co.
 * Inc." for KKR, KKRT, KKR-PD, and KKRS alike), carrying no per-security
 * signal at all. The real, confirmed pattern instead: a company's real
 * common stock is consistently its SHORTEST ticker — KKR (3 chars) vs.
 * KKRT/KKR-PD/KKRS (4-6 chars); SO (2 chars) vs. five real junior-note
 * tickers (all 4 chars, SOJC/SOJF/SOJE/SOMN/SOJD). Preferred and note
 * series get a base-plus-suffix naming convention specifically to
 * distinguish them from the common stock they share an exchange with —
 * a real, structural signal, confirmed against live data, not a guess at
 * string content.
 */
export async function buildCikToTickerMap(): Promise<Map<number, string>> {
  const response = await fetch("https://www.sec.gov/files/company_tickers.json", {
    headers: { "User-Agent": requireUserAgent() },
  });
  if (!response.ok) {
    throw new Error(`SEC company_tickers.json request failed: ${response.status}`);
  }
  const data = (await response.json()) as Record<string, TickerEntry>;

  const map = new Map<number, string>();
  for (const entry of Object.values(data)) {
    const ticker = entry.ticker.toUpperCase();
    const existingTicker = map.get(entry.cik_str);
    if (!existingTicker || ticker.length < existingTicker.length) {
      map.set(entry.cik_str, ticker);
    }
  }
  return map;
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

/**
 * Real, resilient orchestration for callers that just want "fundamentals
 * for this ticker, or null" without handling every possible real failure
 * themselves — a company with no CIK, a thin filing history, or a real
 * network hiccup should degrade that one company to null, never throw and
 * block an entire Portfolio Review over one bad lookup. Accepts an
 * optional pre-cached CIK (see Company.cik) to skip the ticker-mapping
 * fetch entirely when the caller already knows it.
 */
export async function fetchFundamentalsResilient(
  ticker: string,
  cachedCik?: string | null,
): Promise<{ cik: string; fundamentals: KeyFundamentals } | null> {
  try {
    const cik = cachedCik ?? (await lookupCik(ticker));
    if (!cik) return null;

    const companyFacts = await fetchCompanyFacts(cik);
    const fundamentals = extractKeyFundamentals(companyFacts);
    return { cik, fundamentals };
  } catch {
    // Deliberately swallowed — a real, honest "we don't have this today"
    // is preferable to crashing the whole review over one company's data.
    return null;
  }
}

/**
 * A given real fact (e.g., NetIncomeLoss) across every real company that
 * reported it for a given real period, in one call — the foundation for
 * any real, market-wide screen. `period` uses SEC's real calendar-period
 * format: "CY2024Q4" for a quarterly duration fact (revenue, net income),
 * "CY2024Q4I" (the I suffix) for an instantaneous, point-in-time fact
 * (assets, liabilities, as reported on a specific date rather than
 * accumulated over a period).
 *
 * Deliberately returns the raw, unparsed response for now rather than a
 * typed shape — after the /v1/upcomingearnings mistake, this project's
 * discipline is to confirm a real response's actual structure before
 * writing parsing logic that assumes one. Real, exact field names get
 * added to a typed parser once the first real call confirms them.
 */
export async function fetchFrame(
  taxonomy: string,
  concept: string,
  unit: string,
  period: string,
): Promise<unknown> {
  const response = await fetch(
    `https://data.sec.gov/api/xbrl/frames/${taxonomy}/${concept}/${unit}/${period}.json`,
    { headers: { "User-Agent": requireUserAgent() } },
  );
  if (!response.ok) {
    throw new Error(
      `SEC frames request failed for ${taxonomy}/${concept}/${unit}/${period}: ${response.status}`,
    );
  }
  return response.json();
}

/**
 * One real company's real value for a Frame's fact, confirmed against a
 * live response (see scripts/diagnose-frames-response.ts). `cik` is a
 * plain number here — genuinely different from every other real CIK in
 * this codebase, which is a zero-padded 10-digit string. Converting
 * between the two is the caller's job, not something to paper over here.
 * `start`/`end` are that specific company's own real fiscal period —
 * companies with a non-calendar fiscal year (a real, common, legitimate
 * case — Apple's own fiscal year ends in September) will show dates that
 * don't align with the nominal calendar period requested. Not a defect,
 * a real fact about how different companies actually report.
 */
export interface FrameEntry {
  cik: number;
  entityName: string;
  /** Only present on a real duration fact (a period, like annual revenue) — genuinely absent on a real instant fact (a point-in-time balance, like total assets or stockholders' equity), confirmed directly against a live response. Never fabricated when missing. */
  start: string | undefined;
  end: string;
  val: number;
}

/**
 * Pure function: extracts the real per-company array from a Frame
 * response, skipping any entry missing a real cik, entityName, or
 * numeric val rather than guessing at one. `end` is required (present on
 * both duration and instant facts); `start` is captured when present but
 * never required — a real, live bug this exact fix corrects: an earlier
 * version required `start` unconditionally, silently discarding every
 * real instant-fact entry (which never carries it), while duration facts
 * kept working normally and masked the problem until the Value screen
 * became the first to actually query an instant fact.
 */
export function parseFrameEntries(raw: unknown): FrameEntry[] {
  if (!raw || typeof raw !== "object" || !("data" in raw) || !Array.isArray(raw.data)) {
    return [];
  }

  const entries: FrameEntry[] = [];
  for (const item of raw.data as Record<string, unknown>[]) {
    if (
      typeof item?.cik !== "number" ||
      typeof item?.entityName !== "string" ||
      typeof item?.val !== "number" ||
      typeof item?.end !== "string"
    ) {
      continue;
    }
    entries.push({
      cik: item.cik,
      entityName: item.entityName,
      start: typeof item.start === "string" ? item.start : undefined,
      end: item.end,
      val: item.val,
    });
  }
  return entries;
}
