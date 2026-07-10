import { NavBar } from "@/components/shared/NavBar";

export default function PortfolioLoading() {
  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-[var(--content-width)] flex-1 px-8 py-10 sm:py-16">
        <p className="text-ink-500 text-[15px]">Comparing your portfolio to today&rsquo;s Brief…</p>
      </main>
    </>
  );
}
