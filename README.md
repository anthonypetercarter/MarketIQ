# MarketIQ

An Investment Intelligence Platform. The product is the **MarketIQ Brief** — a daily,
council-produced recommendation designed to feel like it was prepared by an institutional
investment committee.

This is a founder's-edition MVP, now well past its original two-sprint scope. Brief and
Portfolio are the two live pages (Dashboard was retired — `docs/decisions.md` #8);
Companies and Settings remain intentional "Coming Soon" placeholders. See
`/docs/decisions.md` for the reasoning behind every real implementation decision, and the
project's governing documents — Constitution, MVP Specification, and Sprint 1 Outline —
for product philosophy and scope.

## Stack

- **Framework:** Next.js (App Router) + TypeScript + React
- **Styling:** Tailwind CSS v4 + a frozen editorial design language (see below)
- **Database:** PostgreSQL via Prisma
- **Tooling:** ESLint, Prettier (with Tailwind class sorting)
- **Local infra:** Docker Compose (Postgres only — the app runs on the host)

## Getting Started

### Option 1 — GitHub Codespaces (no local install)

Open this repo in a Codespace (**Code → Codespaces → Create codespace on main**). The
`.devcontainer` config handles everything automatically: installs dependencies, starts
Postgres, runs migrations, seeds realistic data, and forwards port 3000 with a preview
link. Takes a minute or two on first launch; nothing to configure.

### Option 2 — Local

```bash
npm install
cp .env.example .env   # already done in this scaffold; edit values as needed
npm run db:up            # start Postgres in the background
npm run db:migrate        # create the database tables (first run only)
npm run db:seed            # load one realistic day's mock MarketIQ Brief
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local Database

Postgres runs in Docker; the Next.js app runs on the host for a fast dev loop
(hot reload, no volume-mount overhead). Data persists in a named Docker volume
across restarts.

| Command            | Purpose                                             |
| ------------------ | --------------------------------------------------- |
| `npm run db:up`    | Start Postgres in the background                    |
| `npm run db:down`  | Stop Postgres (data persists)                       |
| `npm run db:logs`  | Tail Postgres logs                                  |
| `npm run db:reset` | Stop Postgres and **delete all data** (destructive) |

Connection details are controlled by the `POSTGRES_*` and `DATABASE_URL` values in
`.env` — keep them in sync if you change one.

## Database Schema

The domain model — `User`, `Brief`, `CouncilAssessment`, `Risk`, `Opportunity`,
`RecommendedAction`, `AllocationTarget`, `Company`, `Portfolio`, `Holding` — lives in
`prisma/schema.prisma` and was designed as a product artifact before it was a table
design. See the schema file's comments for the reasoning behind each relationship,
in particular:

- Every `Risk` on a Brief must trace back to at least one `CouncilAssessment` —
  the CIO synthesizes Risks from what the council reported rather than
  originating independent ones.
- `Opportunity` supports both company-specific and thematic entries.
- Confidence is stored as a number (0–100); the Low/Medium/High/Very High label
  shown in the UI is derived at render time, not stored.
- Each `CouncilAssessment` carries a `verdict` (Support / Support with
  Reservations / Neutral / Oppose) — the up-or-down stance behind the
  committee's collective recommendation.
- `Brief.decisionRationale` is the short, one-or-two-sentence line that powers
  the "Today's Decision" section — distinct from the fuller `executiveSummary`.
- Sprint 2 additions: `Company.currentPrice` / `previousClosePrice` / `region`
  (mocked, same spirit as the Council's mocked assessments) and
  `Portfolio.cashBalance`. Sprint 2 only models Equities (Domestic +
  International) and Cash as real holdings — Bonds and Alternatives show as
  target-only ("not yet tracked") on the Portfolio page rather than inventing
  fictional positions. See `docs/decisions.md`.
- `PortfolioReview` — the first model in this project that persists a
  generated judgment rather than a record of something that happened.
  References a `Brief` for evidence context but stays portfolio-specific;
  the `Brief` itself remains portfolio-agnostic, unchanged. One row per
  portfolio per day; verdicts live in one JSON column, not a child table —
  see the Portfolio Review section below and `docs/decisions.md`'s North
  Star Vision for why.
- `Company.assetType` (`EQUITY` | `FUND`, defaulting existing rows to
  `EQUITY`) — funds are a first-class asset type with their own
  concentration ceiling and evidence standard, not `Company` reused
  unchanged. See `docs/decisions.md` #9.

Run `npm run db:migrate` to create or update the tables from the schema, then
`npm run db:seed` to load one realistic day's mock Brief and Portfolio
(`prisma/seed.ts`) — all nine Council voices, synthesized risks, opportunities,
allocations, recommended actions, and eleven diversified holdings designed to
exercise every Portfolio rule. Both commands require network access to
Prisma's engine CDN the first time they run on a new machine — a normal
laptop/CI environment has this; a fully offline sandbox will not.

## Scripts

| Command                | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start the dev server                         |
| `npm run build`        | Production build                             |
| `npm run start`        | Run the production build                     |
| `npm run lint`         | Lint with ESLint                             |
| `npm run format`       | Format the codebase with Prettier            |
| `npm run format:check` | Check formatting without writing changes     |
| `npm run db:migrate`   | Create/update tables from schema.prisma      |
| `npm run db:seed`      | Load one realistic day's mock MarketIQ Brief |
| `npm run db:studio`    | Open Prisma Studio to browse data            |

Postgres scripts (`db:up`, `db:down`, `db:logs`, `db:reset`) are listed in
[Local Database](#local-database) above.

## Pages

Two pages now, not three — see `docs/decisions.md` #8 for why Dashboard was retired and
where its content went. `/` redirects to `/brief`.

- **`/brief`** — the full CIO memo, answering "why should I believe today's
  recommendation." Today's Decision (recommendation, confidence, the immediate next
  action) → **Since Yesterday** (moved here from the retired Dashboard, positioned right
  before Executive Summary — every item it reports is a diff of Brief content, so this is
  Brief's own question, not Portfolio's; "nothing changed" is a valid, shown result) →
  Executive Summary → full Allocation → Recommended Actions → full Opportunities and
  Risks (with source traceability) → the nine-voice Council Summary → What Would Change
  Our Mind → Historical Similarity → the Prepared-by/Approved-by footer.
- **`/portfolio`** — answers "what does today's recommendation mean for my money," not a
  tracker. **Portfolio Review** is the hero, per North Star Vision (`docs/decisions.md`):
  a real Council judgment on the whole real portfolio, generated once per morning —
  narrative (committee minutes) → **Today's Actions** (every real, sized move — new
  positions, additions to existing ones, concentration-driven trims, full exits — the
  actionable conclusion) → Existing Holdings (supporting detail, every position reviewed,
  only what matters leads). Below it: Allocation vs. Target → Current Holdings → Sector
  Exposure → **Investment Progress** (moved here from the retired Dashboard, replacing the
  old separate Portfolio Summary section rather than sitting alongside it — the two showed
  overlapping numbers). See `docs/decisions.md` #7 for the full Portfolio Review
  implementation history, including
  two real production bugs found, fixed, and verified against live data before this UI
  was built.

`TodaysDecision`'s `immediateAction` (the `RecommendedAction` with the lowest
`displayOrder`) is Brief-only now that Dashboard is gone.
`src/lib/brief/sinceYesterday.ts` diffs two Briefs' recommendation, confidence, risks,
and actions against the same static portfolio; no portfolio snapshots or recommendation
history table exist yet (see `docs/decisions.md` #3's addendum for why that's still the
right call). Its one portfolio-dependent item ("Portfolio Health changed") is why Brief
now fetches Portfolio data — a deliberate, narrow, documented exception to decision #4's
Brief/Portfolio separation, not a general loosening of it.

All three routes have a `loading.tsx` (minimal, no spinners — consistent with the editorial
restraint the rest of the app follows) and an empty state for the pre-seed case.

## Market Data

`docs/decisions.md` #5, Milestone 1. `src/lib/marketdata/` — real, tested clients:

- `alpaca.ts` — Alpaca's multi-symbol snapshot endpoint, which returns `latestTrade` and
  `prevDailyBar` together, mapped directly onto `Company.currentPrice` /
  `previousClosePrice`. One request regardless of how many tickers are being refreshed.
- `fred.ts` + `fredSeries.ts` — macro data (yield curve spread, Fed funds rate, a
  high-yield credit spread proxy), named series IDs kept in one place.

Run `npm run data:verify-fred` once `FRED_API_KEY` is set to confirm the connection —
prints the three tracked series with their latest values and direction of movement.
Nothing consumes this data yet; it exists purely to give an immediate "the key works"
moment ahead of Milestone 2 (the Research Packet), the same way `data:refresh-prices`
does for Alpaca.

Both clients separate the network call from a pure parsing function
(`parseSnapshotPrices` / `parseFredObservations`), so the mapping logic is verifiable
against realistic mock responses without hitting either API.

Run `npm run data:refresh-prices` to pull real prices for every seeded `Company` and
update the database — requires `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY`, and
`FRED_API_KEY` in `.env` (see `.env.example` for where to get free keys for both).
Deliberately a manual script for now, not a scheduled job — see decision #5's staging
discipline.

### SEC EDGAR — Real Fundamentals

`edgar.ts` (`docs/decisions.md` #11). Real, primary-source financial data — actual filed
10-Ks and 10-Qs — closing the gap every prior real Opportunity has had: sourced from web
search headlines, never a company's own filings. Genuinely the simplest integration
here — `data.sec.gov` requires no account and no API key at all, confirmed directly from
SEC's own developer docs. The one real requirement is a genuine, identifying
`EDGAR_USER_AGENT` in `.env` per SEC's fair-access policy — a courtesy, not credentials.

Handles two real, documented XBRL quirks rather than naively assuming clean data:
different companies — and the same company over time — report the same real concept
(e.g. revenue) under different tags (a real, live bug: Apple's real filings switched from
`Revenues` to `RevenueFromContractWithCustomerExcludingAssessedTax` around 2018 after
adopting ASC 606; the first version of this code silently returned a stale 2018 figure by
stopping at the first tag with any data — `mostRecentAcrossTags` now checks every known
tag and picks whichever is genuinely most recent by real filing date). SEC's own API also
doesn't guarantee filings arrive in chronological order within a tag, handled the same
way. Never fabricates a figure — genuinely missing data returns `null`.

Run `npm run data:verify-edgar` to confirm the real, live connection end to end. Wired
into the actual research packet, not just Brief prose — every held and candidate
company's real fundamentals flow into `assembleResearchPacket` on every real Portfolio
Review, with `Company.cik` caching SEC's real Central Index Key (never changes, avoids
re-fetching the shared ticker-mapping file) and graceful, per-company degradation to
`null` on any real failure rather than blocking the whole review.

### Bonds — a Real, Actionable Allocation Category

`docs/decisions.md` #12. Every real Brief has always shown a Bonds target with a real gap
against it — nothing could ever be bought to close that gap until this. Real, liquid bond
ETFs (`AGG`, `BND`, `TLT`, `SHY`, `LQD`, `HYG`, `TIP`, etc.) trade exactly like `AAPL` or
`VBR`, so the entire existing Alpaca pricing and paper-sync pipeline works completely
unchanged for them — no new trading integration needed.

`Company.assetClass` (`EQUITY` | `BOND`) is deliberately **orthogonal** to `assetType`
(`EQUITY` | `FUND`), not folded into it — they answer genuinely different questions.
`assetType` drives the concentration ceiling (one company's idiosyncratic risk vs. a
diversified basket); `assetClass` drives which allocation category a holding routes into.
A bond ETF is both `FUND` (still gets the 40% ceiling) and `BOND` (routes to the real
Bonds category) at once. `computeCurrentAllocation` checks `assetClass` first — a bond
ETF is a real, domestic-listed ticker, and without this check would have been silently
miscounted as a US Equity. `computeAllocationGaps` needed zero changes — Bonds simply
stopped being `NOT_TRACKED` once real values started flowing in. Alternatives remains
exactly as untracked as before; this was deliberately scoped to Bonds only.

The Council's evidence standard for a bond is genuinely different, not just less
complete — real yield, duration, and credit-quality reasoning, not earnings, which don't
exist for a bond. `fundamentals` is correctly always `null` for a bond (no 10-Q to file),
named as expected behavior in the system prompt, not a gap.

Individual bonds and T-bills are real and tradeable through Alpaca's actual Fixed Income
API, but that's documented under Alpaca's Broker API tier — a different product surface
than the standard account this project's paper trading already uses — and remains a real,
separate possibility, not pursued here. No structured bond-specific data source exists yet
either (no EDGAR-equivalent for yield/duration) — real bond Opportunities are sourced the
same way every equity Opportunity was before EDGAR and Track Record existed.

### Real Earnings Calendar — Fixing Reactive Research

`docs/decisions.md` #13. Every real Opportunity until this point surfaced because it
happened to already be newsworthy enough to appear in a general search — a real,
structural bias toward already-popular names. `earningsCalendar.ts` answers a different,
more systematic question instead: who is actually reporting this week, real and dated,
independent of what's already being written about.

Genuinely free via api-ninjas.com — no credit card. Worth recording two real corrections
made along the way, not smoothed over: Financial Modeling Prep was the initial choice, but
its own FAQ states the Earnings Calendar endpoint requires a paid subscription. Then, after
switching to API Ninjas, the first real run against `/v1/upcomingearnings` returned a live
`400` — that endpoint turned out to be fully premium-gated too, missed in an earlier search
summary and only caught by actually running it. Rebuilt against `/v1/earningscalendar`
instead, which is free at the endpoint level. Whether it returns real, forward-looking data
on the free tier remains a genuine open question — see `docs/decisions.md` #13's addendum.
Same pure-client pattern as every other market-data source: `fetchEarningsCalendar` does
the real network call, `parseEarningsCalendarEntries` is a pure function turning the raw
response into a clean shape, treating a premium field returned as an upgrade-message
string the same as genuinely missing data (`null`), never coerced into a fabricated number.

Run `npm run data:upcoming-earnings` for the real, dated list for the coming week.
Deliberately **not** wired into the automated Portfolio Review pipeline — this is a
standalone research tool whose output seeds real, deliberate research (the same
EDGAR-plus-news process already used for every real Opportunity), not something acted on
automatically. An earnings date on its own isn't evidence of anything; it's a signal of
where to actually look next.

### Quality Screen — the First Real, Market-Wide Factor Signal

`docs/decisions.md` #14. Real institutional factor investing screens for several distinct
signals (Quality, Value, Growth, Momentum, Balance Sheet strength, insider activity) — this
builds the first one deliberately alone, not all at once. The reusable Frames-fetching
layer is generic from day one, so a second factor is cheap to add; only Quality is wired
into real output for now, after weighing the real cost of building several at once (the
same tag-inconsistency bug recurring per new fact, SEC's real rate limit getting more
fragile with more calls per run, nothing yet validating whether _any_ factor correlates
with a good real outcome, and factor-combination being a real investment decision six
simultaneous builds would force through rushed).

**A hard, structural boundary: equities only.** Funds file genuinely different real SEC
forms and don't have a net income margin — evaluating one needs a different real toolkit
entirely (expense ratio, duration, credit quality), named as a separate, unaddressed
future scope, not something this screen extends to cover.

Built on `edgar.ts`'s `fetchFrame`/`parseFrameEntries` — SEC's real Frames API returns one
fact (e.g., `NetIncomeLoss`) across every reporting company at once. Confirmed the real
response shape via a live diagnostic (`npm run data:diagnose-frames`) before writing any
parsing logic, the same discipline this project committed to after the earnings-calendar
mistake. That confirmation surfaced three real, honest facts worth knowing: Frame data
uses a plain-number CIK (every other real CIK here is a zero-padded string), fiscal years
genuinely don't align across companies (a real, legitimate fact, not a data quality
issue), and one real Frame alone returns 6,000+ companies including genuine noise.

`src/lib/research/qualityScreen.ts`'s `computeQualityScreen` is a pure function joining
real revenue and net income across two real periods by CIK, requiring complete data in all
four datasets or skipping a company entirely (never a partial or guessed-at result). Three
real decisions, reasoned through rather than defaulted to: a **$1B trailing-revenue
floor**, applied as free local filtering after the fetch, to keep results in the same
weight class as what's already seriously held; fiscal-year misalignment **disclosed, not
corrected** — a company's own real margin trend is unaffected by when its fiscal year
lands, and forcing calendar alignment would penalize genuinely good businesses (Apple's
own real fiscal year ends in September) for an irrelevant reason; and — caught by the
first real, live run, not anticipated in advance — the **current period's margin must
itself be genuinely positive**, not merely improved. That first run ranked a company still
at a real -71.6% margin above genuine turnaround stories like Robinhood and Coinbase,
purely because raw point-improvement rewards "less disastrous" over "already good." A
large, still-unprofitable company deliberately reinvesting for growth is real and
legitimate — it's just answering Growth's real question, not Quality's, and belongs to a
future, separate Growth screen rather than a loosened Quality one. See `docs/decisions.md`
#14's addendum for the full reasoning, including a real correction: Amazon was raised as an
example of this pattern, but Amazon's real, current net margin is 12.22% — it's been
solidly profitable since roughly 2020, not the near-breakeven story it was a decade ago.
One further real, disclosed gap: only the primary `Revenues` tag is used for now, not the
full fallback list already built for per-company lookups — a company using the alternate
tag is missing from results, not misrepresented.

Run `npm run research:screen-quality` for a real, current shortlist of companies that are
genuinely profitable today and getting more so. Standalone research tool, same as the
earnings calendar — seeds real, deliberate research, not acted on automatically.

### Growth Screen — the Second Real Factor Signal

`docs/decisions.md` #15. The second of the real factors named when this screening effort
was scoped: real revenue growth acceleration, not just "revenue went up." Built second,
deliberately, per decision #14's own sequencing reasoning — and the real payoff shows up
immediately: the entire generic Frames-fetching layer needed zero new code, only the real,
factor-specific join-and-filter logic (`src/lib/research/growthScreen.ts`) is new. Same
equities-only boundary as Quality, for the same real reason.

**One real lesson from Quality applied proactively here, not discovered the hard way
twice.** Quality's own first live run found that ranking purely by improvement rewarded a
company still deeply unprofitable, just less so than before. The identical failure shape
exists for growth — a company shrinking 50% one year and only 10% the next shows a large
raw "acceleration" while still genuinely shrinking. `computeGrowthScreen` requires the
most recent real growth rate to be genuinely positive from the start, rather than waiting
for a live run to surface the same bug a second time. Same $1B revenue floor and
fiscal-year-misalignment-disclosed-not-corrected decisions carried over from Quality, for
the same real reasoning.

Needs three consecutive real periods, not two — acceleration requires two real growth
rates to compare — but genuinely costs one fewer real Frame call than Quality (three
Revenue fetches, no NetIncomeLoss at all), a concrete example of how a purely
revenue-based factor is cheaper than one needing two real facts. Run `npm run
research:screen-growth` for a real, current shortlist of companies with genuinely
accelerating, currently-positive growth.

### Value Screen — the Third Real Factor Signal, the First Needing a Real Price

`docs/decisions.md` #21. Named as the highest-value factor to build next specifically
because it had already worked manually — Lincoln National's entire real thesis was a
value story (P/B 0.84 vs. the industry's 1.80), found on one name the screens happened to
surface for an unrelated reason. This scales that exact kind of analysis across the whole
market.

The real, structural difference from Quality and Growth: both work entirely off EDGAR
data; Value's two real ratios (P/E, P/B) both need a live share price, which EDGAR has no
concept of. Deliberately split into two real phases rather than combined: `shortlistValueCandidates`
filters purely on real fundamentals, no price touched at all; only
`computeValueScreenResults`, given real prices already fetched for that narrowed
shortlist, computes the actual ratios — avoiding a real, live price fetch for every
candidate the fundamentals filter would throw away anyway.

A real, new gap closed along the way: Frame data carries CIK and entity name, never a
ticker — Value is the first screen needing a real ticker (to fetch a real Alpaca price),
so `buildCikToTickerMap` was added to `edgar.ts`, building the full real reverse map from
the same free ticker-mapping file `lookupCik` already used.

Two real design decisions: a **$1B StockholdersEquity floor** (not the revenue floor
Quality/Growth used, since Value's own inputs don't include revenue), with genuinely
positive net income and equity both required outright — a real P/E or P/B against a real
loss or negative book value is nonsensical, not just unflattering. And "cheap" is measured
against a **real, internally-computed median** across the qualifying universe itself, not
an arbitrary number or an external industry-average source that doesn't exist here.

One real, unverified assumption, disclosed rather than hidden: shares outstanding comes
from the `dei` taxonomy's `EntityCommonStockSharesOutstanding`, confirmed working via live
diagnostics after an initial real bug: `parseFrameEntries` required a `start` field
unconditionally, silently discarding every real instant-fact entry (which never carries
one) until Value became the first screen to exercise that code path.

A second real bug surfaced once that fix ran live: Alpaca's batch price endpoint rejects
the entire request if even one symbol is invalid, and a real preferred-share ticker
crashed the fetch for all 687 candidates at once — fixed with a real, standard-common-
stock-only ticker filter, which is also a substantive choice, not just a technical one
(P/E and P/B don't mean anything for a preferred share).

A third, more interesting real issue surfaced after that: Netflix showed an absurd P/E of
3.6. Two more live diagnostics traced this to a genuine corporate action — Netflix's real
10-for-1 stock split (November 2025) — that made EDGAR's real, but pre-split, share count
silently incompatible with Alpaca's real, live, post-split price. The fix, scoped
directly with the founder: shares outstanding now uses a real, most-recent-first cascade
across four quarters rather than one fixed period (economically correct, since a split
doesn't change real earnings or equity, only the share count), plus a real, cheap safety
net excluding any result whose P/E falls below 20% of the real, computed median as an
implausible outlier.

Run `npm run research:screen-value` standalone, or as part of `npm run research:daily`
alongside Quality and Growth — same standalone-research-tool discipline, not auto-inserted
into any Brief.

**Verified:** the full join-and-filter logic against realistic synthetic data — a
loss-making company excluded before any price would be fetched, a company with no real
live price excluded rather than fabricated, and the real P/E/P-B math confirmed exactly
correct against hand-computed values. The two-phase split verified directly, and the
import-safety guard confirmed to never trigger a real fetch merely from being imported.

### REDUCE for Real Category Rebalancing, Not Only Concentration Breaches

`docs/decisions.md` #16. A real, live portfolio surfaced the actual gap: the Council was
already using real allocation gaps to decline new buys in an overweight category, but
nothing told it to consider the other half of the same logic — trimming an _existing_
holding in that overweight category specifically to help fund a genuinely underweight
one. The prompt-level directive worked on the very first live run: VBR received a real
REDUCE, with the Council explicitly citing the category-rebalancing logic. But the actual
trade computed was "sell 1 share (~$245.50)" — real, but functionally meaningless against
a ~20-point real overweight, because the only sizing math REDUCE ever had
(`computeReduceToConcentrationCeiling`) only answers "how much is this position over its
own ceiling," and VBR was barely over that.

The fix, still free of any return forecasting: `computeCategoryOverweightValue` computes
the real, current dollar amount a category is over its own target — pure current-state
math, not a prediction about which category performs better. `sizeCategoryRebalanceReduces`
sizes one or more REDUCE-verdict holdings against that real, shared, shrinking dollar gap
— the sell-side mirror of the shared cash pool multiple new BUYs already compete for,
bounded by both the real remaining gap and each position's own real value. _Which_ holding
gets picked for REDUCE stays exactly where it was — the Council's own real, evidenced
judgment; this only fixes how much gets sold once a ticker is chosen. When both the
concentration-ceiling trim and the category-rebalancing trim apply, the real, larger one
wins — either real, independent justification supports at least that much of a trim. A
new `categorizeHolding` helper, extracted from `computeCurrentAllocation` and re-verified
to produce byte-identical results, keeps the category logic used for sizing and for
computing the real gaps from ever silently drifting apart.

**Verified:** the exact real scenario from the live run was replicated directly — the old
mechanism alone produces the real 2-share, ~$491 trim; the new, combined logic correctly
produces an 80-share, ~$19,640 trim instead, a real, meaningful correction rather than the
near-useless number the first version shipped with. Also verified: correct real dollar
computation for a genuine overweight (and a correct 0, not negative, for an underweight),
two holdings correctly sharing one real, shrinking pool, and a small position correctly
bounded by its own real value rather than an impossible oversell.

### One Real Command for the Daily Research Routine

`docs/decisions.md` #17. Two consecutive real Briefs both had to disclose the same honest
gap — neither Quality nor Growth had actually been run that day, since they'd only ever
been triggered manually and separately. `npm run research:daily` runs both in one real
sequence.

Deliberately kept separate from `council:sync-and-review` — that command is fast and gets
run often, sometimes several times in one morning; both screens are genuinely slow
(multiple large, rate-limited SEC fetches), so bolting them on would tax every quick
portfolio check for a routine that only needs to run once a day.

**Deliberately does not auto-insert anything into a Brief** — the more important real
boundary. Every real Opportunity so far went through a real review step first, the same
discipline the Council applies to every verdict; auto-inserting whatever clears a numeric
threshold would skip that judgment silently, and there's no real evidence yet (Track
Record needs real accumulated history first) that clearing either threshold actually
correlates with a good outcome.

`screen-quality.ts` and `screen-growth.ts` were refactored to export their core logic as
`runQualityScreen()`/`runGrowthScreen()`, guarded so merely _importing_ either function
never triggers a real fetch as a side effect — verified directly by stubbing `global.fetch`
to throw on any call and confirming zero fetches happened from the import alone.
`scripts/research-daily.ts` imports and runs both in sequence; each script still works
exactly as before when run directly, unchanged.

### A Same-Day REDUCE Now Funds a Same-Day BUY

`docs/decisions.md` #18. A real, repeated pattern across four consecutive live runs:
AstraZeneca (three times) and Lincoln National (once) were all approved by the Council,
and every time the result was "approved, but no Excess Cash/room left to size it today"
— even on days the Council also issued a real REDUCE that would have freed up exactly
that kind of capital. The precise cause: BUY sizing used cash as it stood _before_ that
same day's own REDUCE/EXIT trades were priced in — two real, correct calculations that
never talked to each other.

The fix: REDUCE and EXIT are now sized first, before BUY/INCREASE, and their real,
combined proceeds are added to Excess Cash before `sizeApprovedBuys` runs. Deliberately
simple — real proceeds from an already-approved sell are treated as real, spendable
capital for an already-approved buy the same day, no new forecasting or selection logic.
_Which_ holdings get REDUCEd and which candidates get BUY verdicts remain exactly the
Council's own judgment; this only fixes what capital the sizing math can see. One honest
limitation, stated plainly: this makes the _recommendation_ coherent, but can't enforce
that a person actually executes both halves of a proposed pair in the real world.

**Verified:** the exact real shape of the repeated problem was replicated using the same
real functions the script now calls in sequence — confirmed the fix takes a real BUY
candidate from zero shares to 97 real shares (~$3,351), funded entirely by a real,
category-driven REDUCE's own computed proceeds.

### A Real, Escalating Ceiling for Company/Sector-Specific-Risk REDUCEs

`docs/decisions.md` #19. A real, live run surfaced a genuine third category of REDUCE
with no sizing mechanism at all: the Council trimmed ASML for a real, severe chip-sector
correction — neither over its own ceiling (only 3.3% of the portfolio) nor part of an
overweight category (International Equities was genuinely underweight). The REDUCE was
real and well-evidenced; the deterministic layer had no tool for company or sector-
specific risk, correctly falling back to the honest "no mechanical trim" message.

A fixed flat-percent trim was rejected outright — it wouldn't respond to how severe a
specific risk actually is. Instead: a real, escalating ceiling keyed off genuine,
persistent history. `countConsecutiveRiskFlaggedDays` looks back through real, stored
Portfolio Review history and counts how many consecutive prior days a ticker showed a
REDUCE with no mechanical trim — the precise signature of this scenario.
`computeRiskEscalatedCeilingPercent` turns that into a real ceiling multiplier: 75% of
normal on day one, 50% on day two, 25% on day three, floored at 10% from day four onward
— deliberately never 0%, since that would quietly turn a REDUCE into a backdoor EXIT. Any
day that breaks the pattern (a HOLD, a real mechanically-sized trim, or no verdict at
all) resets the streak to zero and the ceiling back to normal.

One real, honest limitation: this doesn't guarantee an immediate fix for an already-small,
newly-flagged position — ASML's real 3.3% wouldn't clear even day one's tightened 6%
ceiling. The mechanism responds to _persistent_ real risk by design, not necessarily the
first day it appears.

`computeReduceToConcentrationCeiling` was refactored into a thin wrapper around a new,
general `computeReduceToCeilingPercent`, shared with the new risk-escalated path so the
two can never silently diverge. The risk-escalated path only engages when neither the
concentration nor category mechanism produced a trade — a real fallback of last resort.

**Verified:** the escalation formula, the refactor's exact backward compatibility, and
the streak-counting logic against four real scenarios (a genuine multi-day streak, a
reset on no action, a reset on a real mechanically-sized trim, and no cross-ticker
leakage). A full, real, end-to-end pass against actual Postgres — seeding real,
consecutive risk-flagged rows, running the real query pattern, and feeding the result
through the escalated sizing function — confirmed the whole chain, including a correct
exact-boundary case and a position genuinely over that boundary producing a real trim.

### Real, Relative Conviction — a Genuine Swap Signal, Not a Forecast

`docs/decisions.md` #20. Five consecutive live runs showed the same pattern: a
well-evidenced BUY kept landing on "approved, but no room," while the real allocation
imbalance behind it never moved, because the Council never found an existing holding
individually weak enough to trim. Every prior fix was working correctly — there was
simply nothing weak enough to act on. The founder asked how a real institution handles
this and named it precisely: a real "relative value" swap — trim the weakest current
conviction to fund the strongest new one, if the gap is genuinely meaningful. Distinct
from profit-forecasting (already rejected elsewhere in this project): this compares real,
present-day conviction, not predicted future performance.

The real, structural gap: a new candidate always had a real conviction score, set once at
research time; an existing holding never had a comparable number, only qualitative
language. The fix: the Council now scores every existing holding's own real, current
conviction (0-100) fresh, every day. The real chicken-and-egg problem — today's packet is
built before today's score can exist — is resolved by using _yesterday's_ real, stored
score instead, reusing the exact same historical-lookback pattern decision #19 built,
rather than duplicating it.

The margin is a real, deliberate policy choice: initially proposed at 15 points, the
founder found that too heavy and asked to start at 10 — the same "pick a defensible
number, be ready to revisit it" discipline as the $1B revenue floor or the risk-escalation
schedule. Framed as a real reason to _weigh_ a swap seriously, not a mechanical trigger —
a holding with a genuinely strong conviction shouldn't be trimmed just because a new
candidate exists.

**Verified:** the defensive conviction parser correctly handles a valid score, an
out-of-range value (degrading to `undefined`, never clamped), and a missing value
(degrading gracefully without invalidating the verdict). The packet correctly carries a
real, pre-fetched `priorConviction` through, and degrades gracefully when omitted. A full,
real, end-to-end pass against actual Postgres — two real holdings with genuinely
different stored scores (42 and 88), the real query pattern, and the real packet-assembly
function — confirmed the whole chain, including the real 46-point gap reaching the packet
intact, well clear of the real 10-point margin.

### Paper Portfolio Sync

`alpacaTrading.ts` is a **read-only** client for a real Alpaca paper trading account —
it fetches your actual positions and cash balance, and never places an order. Run
`npm run data:sync-portfolio` to mirror your paper account into `Portfolio`/`Holding`
exactly: closed positions are removed, not left stale, and cost basis comes from
Alpaca's own `avg_entry_price` (per-share), not `cost_basis` (the total position cost —
an easy field to grab by mistake, since our `Holding.costBasis` is per-share throughout
the codebase).

A ticker Alpaca reports that MarketIQ has never seen gets created with honest
placeholders (`name` = ticker, `sector` = "Unknown", `region` = "DOMESTIC") rather than a
guess — Alpaca's positions endpoint doesn't return company metadata, only price and
quantity. Correct these by hand (`npm run db:studio`) if Sector Exposure accuracy
matters to you before your next look at the Portfolio page.

## Portfolio Review

North Star Vision (`docs/decisions.md`). The Council reviews the whole real portfolio
together in one AI call — not one holding in isolation — and produces an independent
investment verdict per holding (`BUY` / `INCREASE` / `HOLD` / `REDUCE` / `EXIT`), each with
real evidence, plus a short narrative in the voice of committee meeting minutes rather
than a trade list.

- `src/lib/council/researchPacket.ts` — pure function structuring real Brief + portfolio
  data into what the AI call reads. No AI logic here.
- `src/lib/council/generatePortfolioReview.ts` — the single AI call (Anthropic API,
  structured output via forced tool use). Returns raw, unvalidated output only.
- `src/lib/council/validatePortfolioReview.ts` — validates every verdict against the
  research packet before anything is trusted. **Per-holding failure isolation**: one
  malformed or unvalidatable verdict degrades to a safe `HOLD` for that holding alone,
  never invalidates the other real verdicts, never throws.
- `src/lib/portfolio/playbook.ts` also gained `computeReduceToConcentrationCeiling`,
  `computeExitSizing`, and `sizeApprovedBuys` — the only genuinely new deterministic
  math this feature needed. The AI decides the verdict; these functions turn a verdict
  into a real share count, the same separation of responsibility Today's Playbook
  already established for `BUY`/`INCREASE`.

**New positions, not just existing holdings.** The research packet includes
`candidates` — company-specific Opportunities from today's Brief not currently held —
so the Council can recommend starting a position, not only judge what's already owned.
`BUY` is the only valid verdict on a candidate (an unheld ticker can't sensibly be
`REDUCE`d); anything else is discarded, not guessed at. Zero, one, or more than one new
position can be approved on the same morning — real, evidenced candidates each get
weighed independently, not artificially capped at one. Approved BUYs are sized against
a **shared** Excess Cash pool in conviction order (`sizeApprovedBuys`), so a
lower-conviction second candidate only gets funded with whatever's left after the first.
`INCREASE` on an existing holding shares this exact mechanism — same shared pool, same
concentration ceiling — starting from the position's real current value instead of $0
(`docs/decisions.md` #7's addendum).

**Funds are a first-class asset type, not a stock in disguise** (`docs/decisions.md` #9).
`Company.assetType` is `EQUITY` or `FUND` — a real CIO's toolkit isn't limited to single
stocks. A fund still flows through the exact same candidate pipeline UNH and JNJ use, but
gets a genuinely different, higher concentration ceiling (`FUND_CONCENTRATION_PERCENT`,
40% vs. 8% for a single equity — a diversified basket doesn't carry one company's
idiosyncratic risk) and a genuinely different evidence standard (the Council's system
prompt explicitly expects a fund's thesis to be structural — diversification, sector or
market positioning — not an earnings-catalyst shape that doesn't exist for a fund).
Every sizing function reads the right ceiling through one shared
`getConcentrationCeilingPercent(assetType)` in `playbook.ts` rather than each hardcoding
it independently. Sector Exposure needed no code changes — it already groups by whatever
string sits in `Company.sector`; the only requirement is giving a fund an honest value
like `"Diversified"` rather than forcing it into one industry, documented directly in
`prisma/schema.prisma`.

Generated **once per real morning**, not on every page load — an LLM call has real
latency and cost that deterministic portfolio math doesn't, and identical inputs aren't
guaranteed to produce identical output twice. `PortfolioReview` is a genuinely new
persisted model (the first one in this project that exists to publish a judgment rather
than record something that happened), deliberately minimal: one row per portfolio per
day, one JSON column for all verdicts, no child table per verdict until a real need to
query across days actually arises.

Requires `ANTHROPIC_API_KEY` in `.env` (get one at
[console.anthropic.com](https://console.anthropic.com)). Run
`npm run council:generate-review` once a real Brief and a real portfolio with holdings
both exist — prints the full narrative and every verdict with its evidence to the
terminal.

**For daily use, run `npm run council:sync-and-review` instead of the individual steps.**
It chains `data:refresh-prices` → `data:sync-portfolio` → `council:generate-review` in
that order. This exists because those three running independently is exactly how the
Council's review and your actual portfolio can silently drift apart — e.g. buying
something directly in Alpaca and forgetting to sync means Portfolio Review keeps
recommending a position you already opened. The combined command makes that drift
harder to cause by accident, not impossible to cause on purpose (you can still run the
steps individually if you want to).

**UI:** `src/components/portfolio/PortfolioReviewPanel.tsx`, now the hero of `/portfolio`.
**Today's Actions** leads — every real, sized move the Council approved: new positions
(`BUY`), additions to existing ones (`INCREASE`), concentration-driven trims (`REDUCE`),
full exits (`EXIT`), each with a real trade size when one exists, or an honest "why not"
note when it doesn't (no room/cash left; or, for a qualitative `REDUCE` not backed by a
concentration breach, no mechanical trim to compute). Existing Holdings follows as
supporting detail — a position can appear in both, intentionally: full evidence there,
the real trade here. An empty state prompts running the generation script when no review
exists yet for today's Brief. No execution buttons anywhere — the same "MarketIQ
proposes, never places an order" boundary as everywhere else in this app.

**Two real production bugs, found and fixed against live output, not caught in
synthetic testing:** the model twice leaked its full structured response — narrative
prose, then the verdicts array as literal JSON text — inside the `narrative` string
field alone, in two different shapes across two separate live calls. `validatePortfolioReview.ts`'s
repair step no longer depends on any specific wrapper tag; it detects the leak
structurally (an empty `verdicts` field plus a literal `"ticker"` substring in the
narrative) and extracts the JSON via balanced-bracket matching wherever it actually
sits. See `docs/decisions.md` #7 for the full history.

**`computeTodaysPlaybook`** (decision #6's original algorithm) still exists in
`src/lib/portfolio/playbook.ts` and is still exercised by `scripts/verify-playbook.ts` —
deliberately left alone rather than deleted alongside its UI. Whether to remove it
entirely is a real decision, not something to fold into a UI swap.

## Track Record

The outcome-measurement loop this project never had (`docs/decisions.md` #10). Every real
Brief and Portfolio Review has been evidenced and disciplined, but nothing checked whether
a past judgment actually turned out to be right — this closes that gap, deliberately
scoped small as a first real building block, not a finished feature.

**The honest constraint:** no historical price data exists before this feature shipped —
`Company.currentPrice` gets overwritten on every refresh, so real evaluation only starts
accumulating from today forward, not retroactively. Two real sources of signal make today
useful anyway:

- `Holding.costBasis` already captures the real price paid on every actual Buy/Increase —
  real performance since purchase is computable today with zero new infrastructure.
- `priceAtVerdict` — added to every verdict in `PortfolioReview.verdicts` this session
  (no migration needed, same JSON-shape-can-evolve precedent as the rest of that column)
  — captures the real price at the moment of judgment, accumulating going forward.

`src/lib/council/trackRecord.ts`'s `computeVerdictOutcome` is deliberately simple and
deterministic, not itself an AI judgment: `BUY`/`INCREASE` score `aligned` if the price
genuinely rose since the verdict, `REDUCE`/`EXIT` score `aligned` if it genuinely fell
(validating the trim or exit). `HOLD` is never scored `aligned`/`misaligned` by design —
judging patience against price direction would silently punish the thing Hold is supposed
to allow. A verdict younger than 7 real days is reported `too_early` rather than judged on
noise; a move under 1% is treated as noise, not signal.

Run `npm run council:track-record` to see both real signals — real holdings performance
since purchase, and verdict-level evaluation once enough real reviews exist to check.
Terminal-only for now, same discipline as every prior milestone: verify it's trustworthy
before building any UI on top of it.

## Design Language

Frozen after several rounds of founder review — see `src/app/globals.css` for tokens and
`src/components/shared/` for the reusable atoms built from them:

- **Typography:** Source Serif 4 for headlines (editorial, institutional — not decorative),
  IBM Plex Sans for everything functional, IBM Plex Mono for numbers (confidence, allocation
  percentages, tickers) so figures align in tabular columns.
- **Color:** a paper background, an ink grayscale (900 → 100), and exactly one accent —
  brass (`#A9762E`) — used once per screen, never for status or state.
- **No color-coded status system.** Verdict (`VerdictBadge`) uses fill state — solid,
  half-fill, hollow, marked — not color. Market Outlook (`MarketOutlookGauge`) is a five-segment
  gauge, not a stoplight, so a cautious reading never looks alarming.
- **No cards, no buttons for primary actions.** The Today's Decision pattern is hairline
  rules and typography — see `QuietLink` for the CTA treatment and `ConfidenceStat` for how
  confidence supports the recommendation without competing with it.
- **Single light theme for now — dark mode is deferred, not excluded.** Every color is a
  semantic token (`--color-ink-900`, referenced as `text-ink-900`) rather than inline hex, so
  a future `.dark` override can swap the palette without touching component code.
- **Full token set, not just color:** typography scale (`text-hero` → `text-eyebrow`), border
  radius (`radius-sm`, `radius-badge`), and transition timing (`duration-standard`,
  `ease-standard`) all live in `globals.css` as named tokens rather than one-off arbitrary
  values, so new screens stay visually consistent by default.
- **Confidence label thresholds** live in `src/lib/confidence.ts` as an exported
  `CONFIDENCE_THRESHOLDS` config object, not inlined in the function — a single edit point if
  the cutoffs need adjusting once checked against real numbers.

Typefaces load via `next/font/google` in `src/app/layout.tsx`, which requires network access
to Google Fonts at build time — present on any normal machine or CI, not present in the
sandbox this was built in (see commit history / task notes for details).

## Project Structure

```
/src
  /app                    → Next.js routes (/, /brief, /portfolio — / redirects to /brief)
  /components
    /ui                    → shadcn/ui primitives
    /brief                  → Brief-specific presentational components (includes Since Yesterday, moved from the retired Dashboard)
    /portfolio               → Portfolio-specific presentational components (includes Investment Progress, moved from the retired Dashboard)
    /shared                   → Cross-page atoms (VerdictBadge, Dateline, ConfidenceStat, NavBar, etc.)
  /services
    /council                 → Still empty, still by design — see docs/decisions.md #1. Real Council
                                automation ended up living in /lib/council instead once it was actually
                                built (decision #7); this scaffold predates that and was never the path
                                that got used.
  /lib                       → DB client (prisma.ts), confidence.ts, labels.ts, formatting helpers
    /portfolio                 → Rule engine: thresholds.ts, allocation.ts, rules.ts, summary.ts, playbook.ts
    /brief                       → sinceYesterday.ts (moved from the retired Dashboard)
    /council                      → Research packet assembly, the Council's AI call, validation — decision #7
    /marketdata                    → Alpaca, FRED, Alpaca Trading clients — decision #5's Milestone 1
    /data                            → Page-level Prisma queries (brief.ts, portfolio.ts)
  /types                      → Empty for now — Prisma's generated types have covered every need so far
  /hooks                       → Shared React hooks
/prisma                        → schema.prisma, prisma.config.ts, seed.ts; migrations generated locally
/docs                           → Supporting documentation
```

Most folders are still scaffolded ahead of use, empty aside from `.gitkeep`
placeholders; they'll be filled in as future sprints need them.

## Environment Variables

See `.env.example` for the full list. Sprint 1 uses a single hardcoded user — no real
authentication.

## Architecture Decisions

`docs/decisions.md` is a lightweight log of decisions worth remembering the reasoning
behind, not just the outcome — starting with why the Investment Council is static seed
data through Sprint 1 rather than a service architecture.
