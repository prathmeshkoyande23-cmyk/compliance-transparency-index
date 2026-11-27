import { test } from "node:test";
import assert from "node:assert/strict";
import { severityPoints, enforcementScore, healthScore, trendBreakdown, viewBank, scoreBank, monthsAgo } from "../src/lib/scoring.js";
import { METHODOLOGY, YEAR_OPTIONS } from "../src/lib/config.js";

const ASOF = new Date("2026-10-22");
const pen = (date, amount) => ({ date, amount, label: "x", reason: "x", regulator: "RBI", source: null });

test("dimension weights sum to 100", () => {
  assert.equal(Object.values(METHODOLOGY.weights).reduce((a, b) => a + b, 0), 100);
});

test("severity tiers, at and either side of each boundary", () => {
  assert.equal(severityPoints(10_000_000), 35);
  assert.equal(severityPoints(9_999_999), 22);
  assert.equal(severityPoints(5_000_000), 22);
  assert.equal(severityPoints(4_999_999), 12);
  assert.equal(severityPoints(1_000_000), 12);
  assert.equal(severityPoints(999_999), 4);
  assert.equal(severityPoints(0), 4);
});

test("enforcement: no penalties scores 100", () => {
  assert.equal(enforcementScore([], ASOF), 100);
});

test("enforcement: a fresh ₹1 crore penalty deducts its full 35 points", () => {
  assert.equal(enforcementScore([pen("2026-10-22", 10_000_000)], ASOF), 65);
});

test("enforcement: penalties decay linearly and are gone after 48 months", () => {
  const d = "2024-10-22";
  const expected = Math.round(100 - 35 * (1 - monthsAgo(d, ASOF) / METHODOLOGY.decayMonths));
  assert.equal(enforcementScore([pen(d, 10_000_000)], ASOF), expected);
  assert.equal(enforcementScore([pen("2022-01-01", 10_000_000)], ASOF), 100);
});

test("enforcement: deductions accumulate and the score never goes below 0", () => {
  const three = [pen("2026-10-22", 10_000_000), pen("2026-10-22", 10_000_000), pen("2026-10-22", 10_000_000)];
  assert.equal(enforcementScore(three.slice(0, 2), ASOF), 30);
  assert.equal(enforcementScore(three, ASOF), 0);
});

test("health: 0% net NPA scores 100, the ceiling scores 0, nothing is invented for null", () => {
  assert.equal(healthScore(0), 100);
  assert.equal(healthScore(3.5), 0);
  assert.equal(healthScore(7), 0);
  assert.equal(healthScore(0.35), 90);
  assert.equal(healthScore(null), null);
});

const trendBank = (net, gross, prevNet, prevGross, penalties = []) => ({
  netNPA: net,
  grossNPA: gross,
  npaPrevious: { netNPA: prevNet, grossNPA: prevGross, label: "prev" },
  penalties,
});

test("trend: improving, steady and deteriorating NPA", () => {
  assert.equal(trendBreakdown(trendBank(0.3, 1.0, 0.5, 1.5), ASOF).npa.score, 100);
  assert.equal(trendBreakdown(trendBank(0.5, 1.5, 0.5, 1.5), ASOF).npa.score, 50);
  assert.equal(trendBreakdown(trendBank(0.7, 2.0, 0.5, 1.5), ASOF).npa.score, 0);
});

test("trend: blends NPA (60%) and penalty activity (40%), and counts at half weight", () => {
  const t = trendBreakdown(trendBank(0.3, 1.0, 0.5, 1.5), ASOF);
  assert.equal(t.enf.score, 50); // no penalties in either window
  assert.equal(t.value, 80); // 0.6 × 100 + 0.4 × 50
  assert.equal(t.coverage, 0.5);
});

test("trend: a component that cannot be computed is dropped, not zero-filled", () => {
  const noPrev = { netNPA: 0.3, grossNPA: 1.0, npaPrevious: null, penalties: [] };
  const t = trendBreakdown(noPrev, ASOF);
  assert.equal(t.npa, null);
  assert.equal(t.value, 50);
  assert.ok(Math.abs(t.coverage - 0.2) < 1e-9); // 0.5 × the 0.4 enforcement share
  // Before 24 months of penalty coverage exist, and with no NPA history, there is no trend at all.
  assert.equal(trendBreakdown(noPrev, new Date("2025-03-31")), null);
});

test("trend: penalty activity compares the last 12 months with the 12 before", () => {
  const worse = trendBreakdown(trendBank(0.5, 1.5, 0.5, 1.5, [pen("2026-06-01", 10_000_000)]), ASOF);
  assert.equal(worse.enf.recent, 35);
  assert.equal(worse.enf.prior, 0);
  assert.equal(worse.enf.score, 0);
  const better = trendBreakdown(trendBank(0.5, 1.5, 0.5, 1.5, [pen("2025-06-01", 10_000_000)]), ASOF);
  assert.equal(better.enf.recent, 0);
  assert.equal(better.enf.prior, 35);
  assert.equal(better.enf.score, 100);
});

const bank = {
  id: "sbi",
  name: "Test Bank",
  cohort: "PSU — Large",
  netNPA: 0.5, grossNPA: 2.0, pcr: null, npaSource: null,
  npaPrior: { asOf: "2026-03-31", label: "Mar", netNPA: 0.6, grossNPA: 2.2, pcr: null, source: null },
  npaQ2: { asOf: "2026-09-30", label: "Sep", netNPA: 0.4, grossNPA: 1.8, pcr: null, source: null },
  penalties: [pen("2025-06-01", 5_000_000), pen("2026-08-01", 1_000_000)],
};

test("year filter: the newest NPA period on or before the as-of date is used", () => {
  assert.equal(viewBank(bank, ASOF).netNPA, 0.4);
  assert.equal(viewBank(bank, ASOF).npaPrevious.netNPA, 0.5);
  const jul = viewBank(bank, new Date("2026-07-15"));
  assert.equal(jul.netNPA, 0.5);
  assert.equal(jul.npaPrevious.netNPA, 0.6);
  const mar = viewBank(bank, new Date("2026-03-31"));
  assert.equal(mar.netNPA, 0.6);
  assert.equal(mar.npaPrevious, null);
});

test("year filter: before any NPA period exists the figure is a gap, not a borrowed number", () => {
  const v = viewBank(bank, new Date("2025-03-31"));
  assert.equal(v.netNPA, null);
  assert.equal(v.npaHiddenByYear, true);
});

test("year filter: later penalties are excluded and counted", () => {
  const v = viewBank(bank, new Date("2026-03-31"));
  assert.equal(v.penalties.length, 1);
  assert.equal(v.hiddenPenaltyCount, 1);
});

test("year filter: before a full year of penalty coverage, enforcement is not scored", () => {
  assert.equal(viewBank(bank, new Date("2025-03-30")).enforcementCovered, false);
  assert.equal(viewBank(bank, new Date("2025-03-31")).enforcementCovered, true);
  const s = scoreBank(viewBank(bank, new Date("2025-03-30")), new Date("2025-03-30"));
  assert.equal(s.dims[0].available, false);
  assert.equal(s.overall, null);
});

test("overall score: weighted by weight × coverage, with confidence reflecting the data present", () => {
  const asOf = ASOF;
  const v = viewBank({ ...bank, penalties: [] }, asOf);
  const s = scoreBank(v, asOf);
  const trend = s.dims.find((d) => d.key === "trend");
  assert.equal(s.confidence, 25 + 20 + 10 * trend.coverage); // enforcement + health + half-weight trend
  const expected = Math.round((100 * 25 + healthScore(0.4) * 20 + trend.value * 10 * trend.coverage) / s.confidence);
  assert.equal(s.overall, expected);
  // Dimensions with no data are absent from the average rather than counted as zero.
  for (const key of ["grievance", "disclosure", "kyc"]) assert.equal(s.dims.find((d) => d.key === key).available, false);
});

test("year options are well-formed", () => {
  assert.equal(new Set(YEAR_OPTIONS.map((y) => y.key)).size, YEAR_OPTIONS.length);
  const dates = YEAR_OPTIONS.map((y) => new Date(y.asOf).getTime());
  assert.deepEqual([...dates].sort((a, b) => b - a), dates);
});
