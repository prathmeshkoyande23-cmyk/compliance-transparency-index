import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { BANKS } from "../src/data/banks.js";
import { YEAR_OPTIONS } from "../src/lib/config.js";
import { viewBank, scoreBank } from "../src/lib/scoring.js";

// A regression snapshot of every bank's overall score in every year view.
// If you change the data or the methodology on purpose, regenerate it with:
//   UPDATE_GOLDEN=1 npm test
const FILE = new URL("./golden-scores.json", import.meta.url);

function snapshot() {
  const out = {};
  for (const y of YEAR_OPTIONS) {
    const asOf = new Date(y.asOf);
    out[y.key] = Object.fromEntries(BANKS.map((b) => [b.id, scoreBank(viewBank(b, asOf), asOf).overall]));
  }
  return out;
}

test("scores match the golden snapshot", () => {
  const now = snapshot();
  if (process.env.UPDATE_GOLDEN) {
    fs.writeFileSync(FILE, JSON.stringify(now, null, 2) + "\n");
    return;
  }
  assert.deepEqual(now, JSON.parse(fs.readFileSync(FILE, "utf8")));
});
