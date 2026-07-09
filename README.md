# MarketIQ

An Investment Intelligence Platform. The product is the **MarketIQ Brief** — a daily,
council-produced recommendation designed to feel like it was prepared by an institutional
investment committee.

This is a founder's-edition MVP (Sprint 1). It is not for public release. See
`/docs` (as it grows) and the project's governing documents — Constitution, MVP
Specification, and Sprint 1 Outline — for product philosophy and scope.

## Stack

- **Framework:** Next.js (App Router) + TypeScript + React
- **Styling:** Tailwind CSS v4 + a frozen editorial design language (see below)
- **Database:** PostgreSQL via Prisma
- **Tooling:** ESLint, Prettier (with Tailwind class sorting)
- **Local infra:** Docker Compose (Postgres only — the app runs on the host)

## Getting Started

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

Run `npm run db:migrate` to create or update the tables from the schema, then
`npm run db:seed` to load one realistic day's mock Brief (`prisma/seed.ts`) —
all nine Council voices, synthesized risks, opportunities, allocations, and
recommended actions for Thursday, July 9, 2026. Both commands require network
access to Prisma's engine CDN the first time they run on a new machine — a
normal laptop/CI environment has this; a fully offline sandbox will not.

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

- **`/`** — Dashboard. Answers "what should I do today" in under 30 seconds:
  Today's Decision, Market Outlook + Allocation, compact Opportunities/Risks, one
  CTA out to the Brief.
- **`/brief`** — the full CIO memo. Today's Decision (with the immediate next
  action), Executive Summary, full Allocation, Recommended Actions, full
  Opportunities and Risks (with source traceability), the nine-voice Council
  Summary, What Would Change Our Mind, Historical Similarity, and the
  Prepared-by/Approved-by footer.

`TodaysDecision` is shared between both pages — the Dashboard omits the
`immediateAction` prop, the Brief supplies it.

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
    /shared                   → Cross-page atoms (VerdictBadge, Dateline, ConfidenceStat, etc.)
  /services
    /council                 → Empty through Sprint 1, by design — see docs/decisions.md #1
  /lib                       → DB client (prisma.ts), confidence.ts, formatting helpers
  /types                      → Empty for now — Prisma's generated types have covered every need so far
  /hooks                       → Shared React hooks
/prisma                        → schema.prisma, prisma.config.ts, seed.ts; migrations generated locally
/docs                           → Supporting documentation
```

Most folders are still scaffolded ahead of use, empty aside from `.gitkeep`
placeholders; they'll be filled in as each Sprint 1 task lands.

## Environment Variables

See `.env.example` for the full list. Sprint 1 uses a single hardcoded user — no real
authentication.

## Architecture Decisions

`docs/decisions.md` is a lightweight log of decisions worth remembering the reasoning
behind, not just the outcome — starting with why the Investment Council is static seed
data through Sprint 1 rather than a service architecture.
