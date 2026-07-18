"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const COMING_SOON = ["Companies", "Settings"];

const NAV_LINKS = [
  { href: "/brief", label: "Brief" },
  { href: "/portfolio", label: "Portfolio" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <div className="border-ink-200 flex h-14 items-center justify-between border-b px-8">
      <Link href="/brief" className="text-ink-900 font-serif text-[15px] font-semibold">
        MarketIQ
      </Link>
      <nav className="flex items-center gap-5 text-[13px]">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "text-ink-900" : "text-ink-700 hover:text-ink-900"}
          >
            {link.label}
          </Link>
        ))}
        {COMING_SOON.map((label) => (
          <span key={label} className="text-ink-300 hidden cursor-default sm:inline">
            {label}
          </span>
        ))}
      </nav>
    </div>
  );
}
