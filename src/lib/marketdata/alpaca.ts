/**
 * Alpaca Market Data API client. Uses the multi-symbol snapshot endpoint,
 * which returns latestTrade and prevDailyBar together — exactly the two
 * numbers Company.currentPrice / previousClosePrice need, in one request
 * regardless of how many tickers are being refreshed.
 *
 * Docs: https://docs.alpaca.markets/reference/stocksnapshots
 */

const ALPACA_DATA_BASE_URL = process.env.ALPACA_DATA_BASE_URL ?? "https://data.alpaca.markets";

export interface AlpacaCredentials {
  keyId: string;
  secretKey: string;
}

export function getAlpacaCredentials(): AlpacaCredentials {
  const keyId = process.env.ALPACA_API_KEY_ID;
  const secretKey = process.env.ALPACA_API_SECRET_KEY;
  if (!keyId || !secretKey) {
    throw new Error("ALPACA_API_KEY_ID and ALPACA_API_SECRET_KEY must be set. See .env.example.");
  }
  return { keyId, secretKey };
}

/** Shape of a single entry in Alpaca's /v2/stocks/snapshots response, trimmed to the fields we use. */
interface AlpacaRawSnapshot {
  latestTrade?: { p: number; t: string };
  prevDailyBar?: { c: number; t: string };
}

export interface TickerPrices {
  currentPrice: number;
  previousClosePrice: number;
}

/**
 * Pure mapping, kept separate from the network call so it's testable without
 * hitting the API — feed it a raw snapshot object and get typed prices back.
 */
export function parseSnapshotPrices(raw: AlpacaRawSnapshot): TickerPrices | null {
  if (raw.latestTrade === undefined || raw.prevDailyBar === undefined) return null;
  return {
    currentPrice: raw.latestTrade.p,
    previousClosePrice: raw.prevDailyBar.c,
  };
}

/**
 * Fetches current + previous-close prices for every ticker in one batched
 * request. Returns a map keyed by ticker; a ticker missing from the
 * response (delisted, no recent trade, etc.) is simply absent from the map
 * rather than throwing — callers decide how to handle a partial result.
 */
export async function fetchSnapshotPrices(tickers: string[]): Promise<Map<string, TickerPrices>> {
  if (tickers.length === 0) return new Map();

  const { keyId, secretKey } = getAlpacaCredentials();
  const url = `${ALPACA_DATA_BASE_URL}/v2/stocks/snapshots?symbols=${encodeURIComponent(tickers.join(","))}`;

  const response = await fetch(url, {
    headers: {
      "APCA-API-KEY-ID": keyId,
      "APCA-API-SECRET-KEY": secretKey,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Alpaca snapshot request failed: ${response.status} ${await response.text()}`);
  }

  const body = (await response.json()) as Record<string, AlpacaRawSnapshot>;

  const result = new Map<string, TickerPrices>();
  for (const [ticker, snapshot] of Object.entries(body)) {
    const prices = parseSnapshotPrices(snapshot);
    if (prices) result.set(ticker, prices);
  }
  return result;
}
