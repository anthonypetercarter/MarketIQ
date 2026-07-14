# MarketIQ

An Investment Intelligence Platform. The product is the **MarketIQ Brief** — a daily,
council-produced recommendation designed to feel like it was prepared by an institutional
investment committee.

This is a founder's-edition MVP. **Sprint 1 and Sprint 2 are complete** — Dashboard, Brief,
and Portfolio are all built and verified against real seeded data; Companies and Settings
remain intentional "Coming Soon" placeholders. See `/docs/decisions.md` for the reasoning
behind key implementation decisions, and the project's governing documents — Constitution,
MVP Specification, and Sprint 1 Outline — for product philosophy and scope.

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

- **`/`** — Dashboard. An executive morning briefing, not a condensed Brief — see
  `docs/decisions.md` #4. Answers exactly four questions, one section each:
  Today's Decision (what should I do), Investment Progress (how am I doing),
  Since Yesterday (what changed — "nothing changed" is a valid, shown result),
  and Continue Reading (two exits: Brief and Portfolio). Market Outlook,
  Allocation, Opportunities, and Risks are deliberately absent — they're
  Brief-exclusive now.
- **`/brief`** — the full CIO memo, answering "why should I believe today's
  recommendation." Today's Decision (with the immediate next action),
  Executive Summary, full Allocation, Recommended Actions, full Opportunities
  and Risks (with source traceability), the nine-voice Council Summary, What
  Would Change Our Mind, Historical Similarity, and the Prepared-by/Approved-by
  footer.
- **`/portfolio`** — answers "what does today's recommendation mean for my
  money," not a tracker. **Today's Playbook** is the hero: Objective →
  Today's Best Trade → Expected Result → Why, per `docs/decisions.md` #6.
  V1 is cash-deployment-only (no sells), recommends at most one highest-conviction
  trade per day, and says "No Trade Today" honestly when nothing clears the
  bar — it never invents a candidate the Brief didn't name. Below it, in
  supporting order: Allocation vs. Target → Current Holdings → Sector
  Exposure → Portfolio Summary. See `src/lib/portfolio/playbook.ts` for the
  algorithm and `docs/decisions.md` #2 for one evidence-sourcing adjustment
  made during implementation.

`TodaysDecision`'s `immediateAction` is one computed value (the
`RecommendedAction` with the lowest `displayOrder`) rendered on both Dashboard
and Brief — one source of truth, two contexts, not two features.
`src/lib/dashboard/sinceYesterday.ts` diffs two Briefs' recommendation,
confidence, risks, and actions against the same static portfolio; no
portfolio snapshots or recommendation history table exist yet (see
`docs/decisions.md` #3's addendum for why that's still the right call).

`TodaysDecision` is shared between Dashboard and Brief — the Dashboard omits the
`immediateAction` prop, the Brief supplies it.

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
  /app                    → Next.js routes
  /components
    /ui                    → shadcn/ui primitives
    /brief                  → Brief-specific presentational components
    /dashboard               → Dashboard-specific presentational components
    /portfolio                → Portfolio-specific presentational components
    /shared                    → Cross-page atoms (VerdictBadge, Dateline, ConfidenceStat, etc.)
  /services
    /council                 → Empty through Sprint 1, by design — see docs/decisions.md #1
  /lib                       → DB client (prisma.ts), confidence.ts, labels.ts, formatting helpers
    /portfolio                 → Rule engine: thresholds.ts, allocation.ts, rules.ts, summary.ts
    /data                       → Page-level Prisma queries (brief.ts, portfolio.ts)
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
