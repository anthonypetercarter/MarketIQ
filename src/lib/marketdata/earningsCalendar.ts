/**
 * API Ninjas — real earnings calendar data.
 *
 * Correction, recorded rather than hidden: this was originally built
 * against /v1/upcomingearnings, which turned out to be fully premium-
 * gated — a real 400 in production caught what a quick search summary
 * missed. Rebuilt against /v1/earningscalendar instead, which is not
 * gated at the endpoint level (only some individual response fields —
 * the *_estimated figures — are premium-only). It is documented
 * primarily for past results; whether querying a future date range
 * returns real scheduled earnings on the free tier, or comes back
 * empty because `show_upcoming` (which forces that behavior) is itself
 * premium-only, is a genuine, unresolved question — not assumed either
 * way here. See docs/decisions.md #13's addendum.
 */

const API_NINJAS_KEY = process.env.API_NINJAS_KEY;

function requireApiKey(): string {
  if (!API_NINJAS_KEY) {
    throw new Error(
      "API_NINJAS_KEY must be set in .env — sign up free (no credit card) at api-ninjas.com.",
    );
  }
  return API_NINJAS_KEY;
}

export interface EarningsEntry {
  ticker: string;
  date: string;
  fiscalYear: number | null;
  fiscalQuarter: number | null;
  /** Free-tier field — the actual reported revenue, only present for results that have already happened. */
  actualRevenue: number | null;
  /** Free-tier field — the actual reported EPS, only present for results that have already happened. */
  actualEps: number | null;
}

interface RawEarningsEntry {
  ticker?: unknown;
  date?: unknown;
  fiscal_year?: unknown;
  fiscal_quarter?: unknown;
  actual_revenue?: unknown;
  actual_eps?: unknown;
}

/**
 * Pure function: parses API Ninjas' raw response into a clean, real shape.
 * Premium-only fields come back on the free tier as an upgrade-message
 * string rather than a number — treated the same as genuinely missing
 * data (null), never parsed as if it were a real figure. Skips any entry
 * missing a real ticker or date entirely.
 */
export function parseEarningsCalendarEntries(raw: unknown): EarningsEntry[] {
  if (!Array.isArray(raw)) return [];

  const entries: EarningsEntry[] = [];
  for (const item of raw as RawEarningsEntry[]) {
    if (typeof item?.ticker !== "string" || typeof item?.date !== "string") continue;
    entries.push({
      ticker: item.ticker,
      date: item.date,
      fiscalYear: typeof item.fiscal_year === "number" ? item.fiscal_year : null,
      fiscalQuarter: typeof item.fiscal_quarter === "number" ? item.fiscal_quarter : null,
      actualRevenue: typeof item.actual_revenue === "number" ? item.actual_revenue : null,
      actualEps: typeof item.actual_eps === "number" ? item.actual_eps : null,
    });
  }
  return entries;
}

/**
 * Fetches real earnings calendar entries for a date range. Note the real,
 * distinct parameter names from the old /v1/upcomingearnings attempt —
 * date_start/date_end here, not start_date/end_date (a genuinely
 * different convention between the two endpoints, easy to get wrong by
 * assuming consistency that doesn't exist).
 */
export async function fetchEarningsCalendar(params: {
  dateStart: string;
  dateEnd: string;
}): Promise<EarningsEntry[]> {
  const url = new URL("https://api.api-ninjas.com/v1/earningscalendar");
  url.searchParams.set("date_start", params.dateStart);
  url.searchParams.set("date_end", params.dateEnd);

  const response = await fetch(url.toString(), {
    headers: { "X-Api-Key": requireApiKey() },
  });
  if (!response.ok) {
    throw new Error(`API Ninjas earnings calendar request failed: ${response.status}`);
  }
  const raw = (await response.json()) as unknown;
  return parseEarningsCalendarEntries(raw);
}
