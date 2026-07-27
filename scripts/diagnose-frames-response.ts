/**
 * Real diagnostic, not yet a screener: fetches one real SEC Frame (every
 * company's NetIncomeLoss for a real, recent annual period) and prints
 * its actual raw shape. After the /v1/upcomingearnings mistake, this
 * project's discipline is to confirm a real response's structure before
 * writing parsing logic that assumes one, not after a live failure.
 *
 * Run with: npx tsx scripts/diagnose-frames-response.ts
 */

import "dotenv/config";
import { fetchFrame } from "../src/lib/marketdata/edgar";

async function main() {
  const taxonomy = "us-gaap";
  const concept = "NetIncomeLoss";
  const unit = "USD";
  const period = "CY2024";

  console.log(`Fetching real Frame: ${taxonomy}/${concept}/${unit}/${period}...`);
  const raw = await fetchFrame(taxonomy, concept, unit, period);

  console.log("\n=== Top-level shape ===");
  if (raw && typeof raw === "object") {
    console.log("Top-level keys:", Object.keys(raw));
    for (const [key, value] of Object.entries(raw)) {
      if (Array.isArray(value)) {
        console.log(`  "${key}": array of ${value.length} entries`);
      } else {
        console.log(
          `  "${key}":`,
          typeof value === "string" && value.length > 80 ? value.slice(0, 80) + "..." : value,
        );
      }
    }
  } else {
    console.log("Unexpected top-level type:", typeof raw, raw);
  }

  console.log("\n=== First 3 real entries (wherever the per-company array actually is) ===");
  const arrayField = Object.entries(raw as Record<string, unknown>).find(([, v]) =>
    Array.isArray(v),
  );
  if (arrayField) {
    const [key, entries] = arrayField as [string, unknown[]];
    console.log(`Found the real per-company array under "${key}":\n`);
    console.log(JSON.stringify(entries.slice(0, 3), null, 2));
    console.log(`\nTotal real companies in this Frame: ${entries.length}`);
  } else {
    console.log("No array field found at the top level — full raw response:");
    console.log(JSON.stringify(raw, null, 2).slice(0, 2000));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
