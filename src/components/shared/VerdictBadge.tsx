import type { CouncilVerdict } from "@prisma/client";

const VERDICT_LABEL: Record<CouncilVerdict, string> = {
  SUPPORT: "Support",
  SUPPORT_WITH_RESERVATIONS: "Support w/ Reservations",
  NEUTRAL: "Neutral",
  OPPOSE: "Oppose",
};

/**
 * Fill state carries the meaning, not hue: solid for Support, half-fill for
 * Reservations, hollow for Neutral, a small mark for Oppose. Approved as
 * final in the design language review — do not add color coding here.
 */
function VerdictIcon({ verdict }: { verdict: CouncilVerdict }) {
  const base = "h-3.5 w-3.5 shrink-0 rounded-full border-[1.5px] border-ink-700";

  if (verdict === "SUPPORT") {
    return <span className={`${base} bg-ink-900`} aria-hidden />;
  }

  if (verdict === "SUPPORT_WITH_RESERVATIONS") {
    return (
      <span
        className={base}
        style={{ background: "linear-gradient(90deg, var(--color-ink-900) 50%, transparent 50%)" }}
        aria-hidden
      />
    );
  }

  if (verdict === "NEUTRAL") {
    return <span className={base} aria-hidden />;
  }

  // OPPOSE
  return (
    <span className={`${base} relative`} aria-hidden>
      <span className="bg-ink-700 absolute top-0 left-[5px] h-3 w-[1.5px] rotate-45" />
      <span className="bg-ink-700 absolute top-0 left-[5px] h-3 w-[1.5px] -rotate-45" />
    </span>
  );
}

export function VerdictBadge({ verdict }: { verdict: CouncilVerdict }) {
  return (
    <span className="border-ink-900 bg-ink-100 text-ink-900 text-caption rounded-badge inline-flex items-center gap-2 border px-3 py-1.5 font-medium">
      <VerdictIcon verdict={verdict} />
      {VERDICT_LABEL[verdict]}
    </span>
  );
}
