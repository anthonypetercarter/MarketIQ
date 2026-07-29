/**
 * Decision #17: one real command for the daily research routine, instead
 * of remembering to run Quality and Growth separately. Deliberately
 * separate from council:sync-and-review — that command is fast and run
 * often, sometimes several times a day; both screens are genuinely slow
 * (multiple large, rate-limited SEC fetches), so bolting them onto the
 * quick command would make every fast portfolio check pay that cost too.
 *
 * Deliberately does NOT insert anything into a Brief automatically. Every
 * real Opportunity so far (CVS, First Solar, BND, AstraZeneca) went
 * through a real review step first — reading the actual evidence and
 * judging it genuinely warranted inclusion, the same discipline the
 * Council itself applies to every verdict. Auto-inserting whatever clears
 * a numeric threshold would skip that judgment silently, and there's no
 * real evidence yet (Track Record needs real accumulated history first)
 * that clearing either threshold actually correlates with a good real
 * outcome. Run this once each real morning; review what it prints the
 * same way as always, and add anything genuinely warranted by hand.
 *
 * Run with: npx tsx scripts/research-daily.ts
 */

import { runQualityScreen } from "./screen-quality";
import { runGrowthScreen } from "./screen-growth";
import { runValueScreen } from "./screen-value";

async function main() {
  console.log("=".repeat(70));
  console.log("QUALITY SCREEN");
  console.log("=".repeat(70));
  await runQualityScreen();

  console.log(`\n${"=".repeat(70)}`);
  console.log("GROWTH SCREEN");
  console.log("=".repeat(70));
  await runGrowthScreen();

  console.log(`\n${"=".repeat(70)}`);
  console.log("VALUE SCREEN");
  console.log("=".repeat(70));
  await runValueScreen();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
