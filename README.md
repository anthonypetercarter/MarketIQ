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
different companies report the same concept (e.g. revenue) under different real tag
names (`extractKeyFundamentals` tries each known one in order), and SEC's own API doesn't
guarantee filings arrive in chronological order (sorted by real filing date before
picking the most recent). Never fabricates a figure — genuinely missing data returns
`null`.

Run `npm run data:verify-edgar` to confirm the real, live connection end to end. Nothing
wired into Brief drafting yet — this is the data-access layer only, same staged approach
Alpaca and FRED followed before it.

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
