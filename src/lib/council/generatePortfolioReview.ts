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
    "Publish today's portfolio committee review: a narrative summary and one verdict per held position.",
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
          "Exactly one entry per holding provided in the research packet — no more, no fewer.",
        items: {
          type: "object" as const,
          properties: {
            ticker: { type: "string" },
            companyName: { type: "string" },
            verdict: {
              type: "string",
              enum: ["BUY", "INCREASE", "HOLD", "REDUCE", "EXIT"],
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

  // TEMPORARY DIAGNOSTIC — remove once the malformed-output issue is understood.
  console.error("=== RAW RESPONSE (debug) ===");
  console.error("stop_reason:", response.stop_reason);
  console.error(
    "content block types:",
    response.content.map((b) => b.type),
  );
  console.error(JSON.stringify(response.content, null, 2));
  console.error("=== END RAW RESPONSE ===\n");

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("The Council's AI call did not return a structured tool_use response.");
  }

  return toolUse.input;
}
