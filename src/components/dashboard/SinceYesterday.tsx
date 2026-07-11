import type { SinceYesterdayItem } from "@/lib/dashboard/sinceYesterday";

export function SinceYesterday({ items }: { items: SinceYesterdayItem[] }) {
  return (
    <div>
      <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">Since Yesterday</h2>

      {items.length === 0 ? (
        <p className="text-ink-700 mt-3 text-[14px]">
          Nothing material changed since yesterday&rsquo;s Brief.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id} className="text-ink-700 flex gap-2 text-[14px] leading-[1.5]">
              <span className="text-ink-300" aria-hidden>
                —
              </span>
              {item.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
