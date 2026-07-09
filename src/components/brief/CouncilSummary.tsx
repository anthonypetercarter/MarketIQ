import { VerdictBadge } from "@/components/shared/VerdictBadge";
import { ROLE_LABEL, ROLE_ORDER } from "@/lib/labels";
import type { CouncilAssessment } from "@prisma/client";

export function CouncilSummary({ assessments }: { assessments: CouncilAssessment[] }) {
  const ordered = ROLE_ORDER.map((role) => assessments.find((a) => a.role === role)).filter(
    (a): a is CouncilAssessment => Boolean(a),
  );

  return (
    <div>
      <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">Council Summary</h2>
      <div className="border-ink-200 mt-3 divide-y divide-[var(--color-ink-200)] border-t">
        {ordered.map((assessment) => (
          <div key={assessment.id} className="py-6">
            {/* Scan row — name, confidence, verdict. This is the whole point:
                a reader should be able to read down just this line for all
                nine rows and understand where agreement/disagreement lies. */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <h3 className="text-ink-900 font-serif text-[17px] font-bold">
                  {ROLE_LABEL[assessment.role]}
                </h3>
                <span className="text-ink-500 font-mono text-[13px]">
                  {assessment.confidenceScore}%
                </span>
              </div>
              <VerdictBadge verdict={assessment.verdict} />
            </div>

            {/* Secondary block — opinion, then the supporting fields, all
                deliberately quieter than the scan row above. */}
            <p className="text-ink-700 mt-2.5 max-w-[600px] text-[13.5px] leading-[1.6]">
              {assessment.opinion}
            </p>

            <dl className="mt-3 flex max-w-[600px] flex-col gap-1.5 text-[12.5px] leading-[1.5]">
              <div className="flex gap-2">
                <dt className="text-ink-300 shrink-0 tracking-[0.03em] uppercase">Rationale</dt>
                <dd className="text-ink-500">{assessment.rationale}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-ink-300 shrink-0 tracking-[0.03em] uppercase">Risks noted</dt>
                <dd className="text-ink-500">{assessment.risksNoted}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-ink-300 shrink-0 tracking-[0.03em] whitespace-nowrap uppercase">
                  Change trigger
                </dt>
                <dd className="text-ink-500">{assessment.changeTrigger}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
