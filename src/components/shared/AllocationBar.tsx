export function AllocationBar({ category, percent }: { category: string; percent: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-ink-900 text-[15px] font-medium">{category}</span>
        <span className="text-ink-500 font-mono text-[13px]">{percent}%</span>
      </div>
      <div className="bg-ink-100 h-1.5 rounded-sm">
        <div className="bg-ink-900 h-full rounded-sm" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
