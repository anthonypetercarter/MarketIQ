/**
 * FRED (Federal Reserve Economic Data) API client. Free, no rate-limit
 * concerns at our volume (~120 req/min allowed, we make a handful per day).
 *
 * Docs: https://fred.stlouisfed.org/docs/api/fred/series_observations.html
 */

const FRED_BASE_URL = "https://api.stlouisfed.org/fred";

export function getFredApiKey(): string {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new Error("FRED_API_KEY must be set. See .env.example.");
  }
  return apiKey;
}

export interface FredObservation {
  date: string;
  value: number;
}

interface FredRawObservation {
  date: string;
  value: string; // FRED returns "." for missing/not-yet-published values
}

/** Pure parse, kept separate from the fetch call for testability. */
export function parseFredObservations(raw: FredRawObservation[]): FredObservation[] {
  return raw.filter((o) => o.value !== ".").map((o) => ({ date: o.date, value: Number(o.value) }));
}

/**
 * Fetches the two most recent published observations for a series (e.g.
 * "T10Y2Y" for the 10y-2y Treasury spread, "FEDFUNDS" for the Fed funds
 * rate), so callers can see both the latest reading and its prior value.
 * Returns an empty array if the series has no recent published data.
 */
export async function fetchLatestObservations(seriesId: string): Promise<FredObservation[]> {
  const apiKey = getFredApiKey();
  const url =
    `${FRED_BASE_URL}/series/observations?series_id=${encodeURIComponent(seriesId)}` +
    `&api_key=${apiKey}&file_type=json&sort_order=desc&limit=2`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `FRED request failed for ${seriesId}: ${response.status} ${await response.text()}`,
    );
  }

  const body = (await response.json()) as { observations: FredRawObservation[] };
  return parseFredObservations(body.observations);
}
