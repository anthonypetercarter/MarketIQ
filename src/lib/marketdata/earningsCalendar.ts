/**
 * API Ninjas — real, free earnings calendar data. Fixes the reactive
 * research bias this project has had since its first real Brief: every
 * candidate so far surfaced because it was already newsworthy enough to
 * show up in a general search, not because it was systematically checked.
 * This answers "who's actually reporting this week" directly, real and
 * dated, rather than stumbling onto it via whatever search happened to
 * surface.
 *
 * Genuinely free — a real API key, no credit card. One honest caveat from
 * their own terms: commercial use isn't permitted on the free tier, a
 * non-issue for a personal project, worth knowing regardless.
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

export interface UpcomingEarning {
  ticker: string;
  date: string;
  epsEstimated: number | null;
  revenueEstimated: number | null;
  exchange: string;
}

interface RawEarningEntry {
  ticker?: unknown;
  date?: unknown;
  eps_estimated?: unknown;
  revenue_estimated?: unknown;
  exchange?: unknown;
}

/**
 * Pure function: parses API Ninjas' raw response into a clean, real shape.
 * Skips any entry missing a real ticker or date rather than guessing —
 * same "never fabricate, degrade honestly" discipline as every other
 * real data client in this project.
 */
export function parseEarningsEntries(raw: unknown): UpcomingEarning[] {
  if (!Array.isArray(raw)) return [];

  const entries: UpcomingEarning[] = [];
  for (const item of raw as RawEarningEntry[]) {
    if (typeof item?.ticker !== "string" || typeof item?.date !== "string") continue;
    entries.push({
      ticker: item.ticker,
      date: item.date,
      epsEstimated: typeof item.eps_estimated === "number" ? item.eps_estimated : null,
      revenueEstimated: typeof item.revenue_estimated === "number" ? item.revenue_estimated : null,
      exchange: typeof item.exchange === "string" ? item.exchange : "UNKNOWN",
    });
  }
  return entries;
}

/**
 * Fetches real, upcoming earnings announcements. All params optional —
 * omitting date bounds returns whatever window the API defaults to.
 */
export async function fetchUpcomingEarnings(
  params: { startDate?: string; endDate?: string; exchange?: string } = {},
): Promise<UpcomingEarning[]> {
  const url = new URL("https://api.api-ninjas.com/v1/upcomingearnings");
  if (params.startDate) url.searchParams.set("start_date", params.startDate);
  if (params.endDate) url.searchParams.set("end_date", params.endDate);
  if (params.exchange) url.searchParams.set("exchange", params.exchange);

  const response = await fetch(url.toString(), {
    headers: { "X-Api-Key": requireApiKey() },
  });
  if (!response.ok) {
    throw new Error(`API Ninjas upcoming earnings request failed: ${response.status}`);
  }
  const raw = (await response.json()) as unknown;
  return parseEarningsEntries(raw);
}
