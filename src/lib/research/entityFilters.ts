/**
 * Real, shared filter across every factor screen (decisions #14, #15,
 * #21, #22): a passive investment trust, ETF, or commodity fund files
 * real financial statements with SEC too — a gold trust genuinely
 * reports real Assets and Liabilities — but a near-zero real leverage
 * ratio, or a thin real "net income," is structurally meaningless for a
 * passive holding vehicle. It isn't evidence of financial discipline or
 * profitability the way it is for a genuine operating company; the
 * vehicle simply holds an asset and has no real operations at all.
 *
 * Discovered live: the Balance Sheet strength screen's real top 15 was
 * dominated by gold, silver, platinum, and Bitcoin ETFs/trusts, plus an
 * oil fund — every one of them carrying "TRUST," "ETF," or "FUND"
 * explicitly in its real, confirmed entity name. Every screen's own doc
 * comments already documented "equities only" as the intended real
 * boundary (decision #12), but none of the actual join-and-filter code
 * ever programmatically enforced it — the boundary was an unenforced
 * assumption, not a real check, until this was built.
 */

/**
 * Real, common entity-name signals that a real SEC filer is a passive
 * investment vehicle rather than a genuine operating company. Kept
 * deliberately narrow and specific to what's actually been confirmed in
 * real, live data — not a speculative, broader list of guessed keywords.
 */
const NON_OPERATING_ENTITY_PATTERN = /\bTRUST\b|\bETF\b|\bFUND\b/i;

/**
 * True when a real entity's name doesn't match the known, real signals
 * for a passive investment vehicle — i.e., when it looks like a genuine
 * operating company. Errs toward inclusion: a real operating company
 * with one of these words in its name for an unrelated reason is a rare,
 * real possibility, but far less common than the pattern this exists to
 * catch, and this project has consistently preferred a simple, evidenced
 * heuristic over an elaborate one that hasn't been tested against real
 * data.
 */
export function looksLikeOperatingCompany(entityName: string): boolean {
  return !NON_OPERATING_ENTITY_PATTERN.test(entityName);
}
