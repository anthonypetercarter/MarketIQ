import Link from "next/link";

export function QuietLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="border-ink-300 text-ink-900 hover:border-ink-900 text-dek duration-standard ease-standard inline-flex items-baseline gap-2 border-b pb-1.5 font-serif italic transition-colors"
    >
      {children} <span aria-hidden>→</span>
    </Link>
  );
}
