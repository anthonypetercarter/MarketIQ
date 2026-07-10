import type { RecommendedChange } from "@/lib/portfolio/rules";

export function RecommendedChangesList({ changes }: { changes: RecommendedChange[] }) {
  if (changes.length === 0) {
    return (
      <div>
        <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">
          Recommended Changes for Your Portfolio
        </h2>
        <p className="text-ink-700 mt-3 text-[14px]">
          Nothing rises above today&rsquo;s thresholds — your portfolio looks consistent with the
          Brief.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">
        Recommended Changes for Your Portfolio
      </h2>
      <div className="border-ink-200 mt-3 divide-y divide-[var(--color-ink-200)] border-t">
        {changes.map((change) => (
          <div key={change.id} className="py-6">
            <div className="text-ink-900 text-[16px] font-semibold">{change.headline}</div>
            <p className="text-ink-700 mt-1.5 max-w-[600px] text-[14px] leading-[1.6]">
              {change.detail}
            </p>
            <p className="text-ink-500 mt-2 text-[12px]">
              <span className="tracking-[0.03em] uppercase">Why you&rsquo;re seeing this</span> —{" "}
              {change.evidence}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
