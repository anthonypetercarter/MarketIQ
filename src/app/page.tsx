import { redirect } from "next/navigation";

/**
 * Dashboard was retired — its Today's Decision was a duplicate of Brief's,
 * and its two genuinely unique sections were relocated rather than
 * deleted: Since Yesterday to the top of Brief (it's a diff of Brief
 * content — "why should I believe this" — so it belongs there), Investment
 * Progress to Portfolio (real portfolio performance, more at home there
 * than it ever was here).
 */
export default function RootPage() {
  redirect("/brief");
}
