/**
 * Portfolio Review — North Star Vision (docs/decisions.md).
 *
 * The Council's single AI call. Reviews the whole portfolio together (not
 * one holding in isolation) — per the founder's framing, a CIO doesn't
 * review positions one at a time; seeing the whole picture at once is what
 * makes comparative judgments (this position vs. that one) possible at all.
 *
 * Returns the raw, unvalidated tool_use input — callers MUST run this
 * through validatePortfolioReview() before persisting or displaying
 * anything. This function only calls the model; it doesn't trust it.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ResearchPacket } from "./researchPacket";

const PORTFOLIO_REVIEW_TOOL = {
  name: "publish_portfolio_review",
  description:
    "Publish today's portfolio committee review: a narrative summary, one verdict per held position, and " +
    "optionally a BUY verdict on a new, currently-unheld candidate if the evidence genuinely supports starting " +
    "a new position.",
  input_schema: {
    type: "object" as const,
    properties: {
      narrative: {
        type: "string",
        description:
          "3-5 sentences in the voice of committee meeting minutes — what the group discussed and why, " +
          "not a list of trades. The verdicts below are the conclusion of this discussion, not a repeat of it. " +
          "This field must contain PLAIN PROSE ONLY — no XML tags, no closing tags, no embedded JSON, and no " +
          "verdicts content of any kind. Put your full reasoning here as prose if you need the space; the " +
          "verdicts array is a separate field below and must be populated there, not inside this string.",
      },
      verdicts: {
        type: "array",
        description:
          "Exactly one entry per holding in the research packet's `holdings` list (using verdict values " +
          "BUY/INCREASE/HOLD/REDUCE/EXIT as appropriate for an existing position) — no more, no fewer of " +
          "those. You may ALSO include additional entries with verdict=BUY for tickers from the packet's " +
          "`candidates` list (companies not currently held) if the evidence genuinely supports starting a " +
          "new position — zero, one, or more than one if multiple candidates are each independently " +
          "warranted. Never use BUY on a candidate ticker as a default; most mornings, no new position is " +
          "warranted at all.",
        items: {
          type: "object" as const,
          properties: {
            ticker: { type: "string" },
            companyName: { type: "string" },
            verdict: {
              type: "string",
              enum: ["BUY", "INCREASE", "HOLD", "REDUCE", "EXIT"],
            },
            conviction: {
              type: "integer",
              description:
                "For an EXISTING HOLDING verdict only (not a new-candidate BUY, which already carries its " +
                "own real conviction from the packet): your real, current conviction in continuing to " +
                "hold this position AT ITS CURRENT SIZE, 0-100, the same scale a candidate's conviction " +
                "uses. 0 means no real confidence left in holding it today; 100 means maximum confidence. " +
                "A real, present-day judgment based on today's actual evidence — not a forecast of future " +
                "returns. Required for every existing-holding verdict; omit for new-candidate BUY entries.",
            },
            evidence: {
              type: "array",
              items: { type: "string" },
              description:
                "1-3 short evidence statements. Every statement must be traceable to something in the " +
                "research packet — a real risk, opportunity, allocation gap, or holding fact. Never invent " +
                "a price move, event, or fact not present in the packet. A HOLD with no new information is " +
                "valid — say so plainly rather than inventing a reason.",
            },
          },
          required: ["ticker", "companyName", "verdict", "evidence"],
        },
      },
    },
    required: ["narrative", "verdicts"],
  },
};

function buildSystemPrompt(): string {
  return [
    "You are the MarketIQ Investment Council, reviewing a real investor's real portfolio.",
    "",
    "This is a portfolio committee meeting, not a stock-picking exercise. Review every holding in the " +
      "research packet together, as one committee would — weighing them against each other, not one at a " +
      "time in isolation. The narrative you write should read like the minutes of that meeting: what the " +
      "group discussed, what stood out, what didn't. The verdicts are the meeting's conclusion, not its " +
      "entirety.",
    "",
    "Hard rules, no exceptions:",
    "- Every evidence statement must trace to something literally present in the research packet you're " +
      "given: a real risk, a real opportunity, a real allocation gap, or a real fact about the holding " +
      "itself (price, cost basis, concentration, sector, region). Never state a price move, news event, " +
      "or fact that isn't in the packet you were given.",
    '- "No new evidence today" is a completely valid, honest reason for HOLD. Do not manufacture a reason ' +
      "where none exists.",
    "- You must return exactly one verdict for every holding listed in the packet — no more, no fewer, no " +
      "verdicts for tickers not held.",
    "- REDUCE and EXIT are real, meaningful conclusions — use them when the evidence genuinely supports " +
      "them, not only when convenient. But don't manufacture urgency either: most mornings, most positions " +
      "genuinely warrant HOLD.",
    "- The narrative field is plain prose only. Never include XML-like tags, closing tags, or a copy of the " +
      "verdicts data inside the narrative string — the verdicts array is its own separate field in the tool " +
      "call and must be populated there directly, not embedded as text anywhere else.",
    "- You may recommend starting a new position by adding a verdict entry with verdict=BUY for a ticker " +
      "from the packet's `candidates` list — only from that list, never a ticker you weren't given. This is " +
      "optional: most mornings, no new position is warranted. Only recommend one when the evidence — the " +
      "candidate's real thesis and conviction, weighed against the portfolio's real allocation gaps — " +
      "genuinely supports it, the same standard as every other verdict.",
    "- A real CIO's toolkit isn't limited to individual stocks — some holdings and candidates in this " +
      "packet are FUNDs (ETFs, index funds), marked by their assetType field, not just EQUITY. Judge them " +
      "by a genuinely different, still real standard: a fund's real thesis is structural (broad " +
      "diversification, sector or market positioning) rather than a single company's earnings or " +
      "guidance — don't require an earnings-beat-style catalyst to justify a fund the way you would for a " +
      "single stock, since that evidence doesn't exist for a fund and never will. A FUND also carries a " +
      "materially higher concentration ceiling than an EQUITY, reflecting that a diversified basket " +
      "doesn't carry one company's idiosyncratic risk — this is already reflected in the sizing math " +
      "downstream, not something you need to account for yourself.",
    "- Some holdings and candidates carry a `fundamentals` field — real, primary-source financial data " +
      "from that company's actual SEC filings (real revenue, net income, total assets, with the real " +
      "fiscal period and filing date it came from), not a news summary of it. When present, this is " +
      "real, citable evidence — use it, and cite the real figures and real filing date, not just that " +
      '"fundamentals look strong." When `fundamentals` is null — a fund, or a company EDGAR couldn\'t ' +
      "resolve — say so honestly if it's relevant, never invent a number to fill the gap.",
    "- A holding or candidate's `assetClass` field (EQUITY or BOND) is a separate, real fact from " +
      "`assetType` (EQUITY or FUND) — a bond ETF is both FUND and BOND at once: FUND for concentration " +
      "purposes (it's diversified, gets the higher ceiling), BOND for what it actually is. A bond's real " +
      "evidence shape is genuinely different from a stock's or a diversified equity fund's — real, " +
      "current facts about yield, duration, and credit quality, or real macro context like the interest-" +
      "rate environment, not earnings or revenue (bonds don't file 10-Ks the way operating companies do, " +
      "so `fundamentals` will be null for a bond and that's expected, not a gap). Judge a bond by that " +
      "real standard, not by trying to force equity-shaped evidence onto it.",
    "- Real allocation gaps are a reason to consider REDUCE on an existing holding, not only a reason to " +
      "decline a new BUY. If one category is genuinely overweight while another is genuinely underweight " +
      "— both real, disclosed facts in the packet's `allocationGaps` — actively ask whether an existing " +
      "holding in the overweight category has a comparatively weaker, staler, or less-evidenced thesis " +
      "than the others in that same category, and whether trimming it specifically would help correct the " +
      "real imbalance. This is a genuine, real judgment call requiring genuine evidence (a real, relative " +
      "comparison among what's actually held), not a mechanical trigger that fires just because a category " +
      "is overweight — most mornings, even a real overweight doesn't by itself justify trimming a holding " +
      "with a real, still-intact thesis. Distinct from the concentration ceiling: that's about one position " +
      "being too large on its own; this is about a category being too heavy relative to another category " +
      "being genuinely light, which can be real even when every individual position is comfortably under " +
      "its own ceiling.",
    "- Every existing-holding verdict needs a real `conviction` score, 0-100 — your genuine, current " +
      "confidence in continuing to hold this position at its current size, based on today's actual " +
      "evidence, not a forecast of future performance. This makes a real, direct comparison possible: when " +
      "the packet's `allocationGaps` shows an overweight category and a real candidate's own conviction " +
      "(from `candidates`) clears an existing holding's conviction in that same category by a real, " +
      "meaningful margin — at least 10 points — that's real, genuine evidence a swap may be warranted: " +
      "REDUCE the weaker-conviction holding specifically to help fund the stronger-conviction candidate. " +
      "This is still your real, case-by-case judgment, not an automatic trigger — a 10-point gap is a " +
      "reason to seriously weigh a swap, not a mechanical instruction to always execute one. A holding " +
      "with a real, still-strong conviction should not be trimmed just because a new candidate exists, " +
      "however appealing — the same discipline as every other REDUCE.",
    "- The packet's `screenResults` field contains real, current, raw output from four market-wide factor " +
      "screens (Quality, Growth, Value, Balance Sheet strength) — genuinely useful, current data, but " +
      "explicitly NOT equivalent to anything in `candidates`. Every name in `candidates` has already been " +
      "through a real, individual diligence pass — checked for real complications a numeric screen can't " +
      "see (a securities-fraud investigation, a genuine revenue decline masked by an annual aggregate, " +
      "heavy insider selling), the same way AppLovin's real fundamentals looked excellent on paper but " +
      "were correctly excluded once actual diligence surfaced serious real problems. A ticker appearing " +
      "in `screenResults` has received none of that real scrutiny — it cleared a numeric threshold, " +
      "nothing more. Never treat a screen appearance alone as sufficient evidence for a BUY verdict; a " +
      "ticker in `screenResults` is not a valid candidate for a new position today, regardless of how " +
      "favorable its numbers look. If something in `screenResults` looks genuinely worth a closer look, " +
      "the correct response is to name it as a real, specific research action for a future review — not " +
      "to act on it now.",
  ].join("\n");
}

function buildUserPrompt(packet: ResearchPacket): string {
  return `Today's research packet:\n\n${JSON.stringify(packet, null, 2)}`;
}

export async function callCouncilForPortfolioReview(packet: ResearchPacket): Promise<unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY must be set. See .env.example.");
  }
  const model = process.env.PORTFOLIO_REVIEW_MODEL || "claude-sonnet-5";

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(packet) }],
    tools: [PORTFOLIO_REVIEW_TOOL],
    tool_choice: { type: "tool", name: "publish_portfolio_review" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("The Council's AI call did not return a structured tool_use response.");
  }

  return toolUse.input;
}
