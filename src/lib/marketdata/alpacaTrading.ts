/**
 * Alpaca Trading API client — read-only by design. This integration syncs
 * FROM a real (paper) Alpaca account INTO our Holding/Portfolio tables; it
 * never places orders. The Constitution's "no trading, no brokerage
 * integration" was written with real-money execution in mind — a read-only
 * paper sync honors that spirit (zero capital at risk, zero execution
 * surface in our own product), but it's still a real category of thing
 * this codebase didn't do before, which is why it required explicit
 * sign-off rather than being folded in quietly.
 *
 * Docs: https://docs.alpaca.markets/reference/getaccount-1
 *       https://docs.alpaca.markets/reference/getallopenpositions
 */

const ALPACA_TRADING_BASE_URL =
  process.env.ALPACA_TRADING_BASE_URL ?? "https://paper-api.alpaca.markets";

function getAlpacaCredentials(): { keyId: string; secretKey: string } {
  const keyId = process.env.ALPACA_API_KEY_ID;
  const secretKey = process.env.ALPACA_API_SECRET_KEY;
  if (!keyId || !secretKey) {
    throw new Error("ALPACA_API_KEY_ID and ALPACA_API_SECRET_KEY must be set. See .env.example.");
  }
  return { keyId, secretKey };
}

async function alpacaTradingGet(path: string): Promise<unknown> {
  const { keyId, secretKey } = getAlpacaCredentials();
  const response = await fetch(`${ALPACA_TRADING_BASE_URL}${path}`, {
    headers: {
      "APCA-API-KEY-ID": keyId,
      "APCA-API-SECRET-KEY": secretKey,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(
      `Alpaca trading request failed: ${path} -> ${response.status} ${await response.text()}`,
    );
  }
  return response.json();
}

// --- Account -----------------------------------------------------------

interface AlpacaRawAccount {
  cash: string;
}

export interface AlpacaAccount {
  cashBalance: number;
}

/** Pure parse, kept separate from the fetch for testability. */
export function parseAccount(raw: AlpacaRawAccount): AlpacaAccount {
  return { cashBalance: Number(raw.cash) };
}

export async function fetchAccount(): Promise<AlpacaAccount> {
  const raw = (await alpacaTradingGet("/v2/account")) as AlpacaRawAccount;
  return parseAccount(raw);
}

// --- Positions -----------------------------------------------------------

interface AlpacaRawPosition {
  symbol: string;
  qty: string;
  avg_entry_price: string;
  current_price?: string;
  lastday_price?: string;
}

export interface AlpacaPosition {
  ticker: string;
  quantity: number;
  costBasisPerShare: number;
  currentPrice: number | null;
  previousClosePrice: number | null;
}

/** Pure parse, kept separate from the fetch for testability. */
export function parsePositions(raw: AlpacaRawPosition[]): AlpacaPosition[] {
  return raw.map((p) => ({
    ticker: p.symbol,
    quantity: Number(p.qty),
    costBasisPerShare: Number(p.avg_entry_price),
    currentPrice: p.current_price ? Number(p.current_price) : null,
    previousClosePrice: p.lastday_price ? Number(p.lastday_price) : null,
  }));
}

export async function fetchPositions(): Promise<AlpacaPosition[]> {
  const raw = (await alpacaTradingGet("/v2/positions")) as AlpacaRawPosition[];
  return parsePositions(raw);
}
