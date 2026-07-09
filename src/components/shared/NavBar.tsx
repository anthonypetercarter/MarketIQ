import Link from "next/link";

const COMING_SOON = ["Portfolio", "Companies", "Settings"];

export function NavBar() {
  return (
    <div className="border-ink-200 flex h-14 items-center justify-between border-b px-8">
      <Link href="/" className="text-ink-900 font-serif text-[15px] font-semibold">
        MarketIQ
      </Link>
      <nav className="flex items-center gap-5 text-[13px]">
        <Link href="/" className="text-ink-900">
          Dashboard
        </Link>
        <Link href="/brief" className="text-ink-700 hover:text-ink-900">
          Brief
        </Link>
        {COMING_SOON.map((label) => (
          <span key={label} className="text-ink-300 hidden cursor-default sm:inline">
            {label}
          </span>
        ))}
      </nav>
    </div>
  );
}
