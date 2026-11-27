// The scoring engine. Pure functions only: no React, no I/O, no globals other
// than the config. Everything here is covered by tests/scoring.test.js.
import { DATA_AS_OF, METHODOLOGY as M, DIMENSION_LABELS as LABEL, PENALTY_COVERAGE_FULL_FROM, npaMeta } from "./config.js";

export const TODAY = new Date(DATA_AS_OF);
const DAY_MS = 1000 * 60 * 60 * 24;
export const monthsAgo = (dateStr, asOf = TODAY) => (asOf - new Date(dateStr)) / (DAY_MS * 30.44);
const clamp100 = (v) => Math.max(0, Math.min(100, v));

// A bank as it would have looked on the as-of date. Each bank holds up to
// three NPA reporting periods (Sep 2026 where reported, Jun 2026, Mar 2026).
// The newest one that ended on or before the as-of date is used, and the one
// before it is exposed so the change (and the Trend dimension) can use it.
export function viewBank(bank, asOf) {
  const curMeta = bank.npaCurrent || npaMeta(bank.id);
  const mk = (v, meta) =>
    v && v.netNPA != null
      ? { asOf: meta.asOf, label: meta.label, verified: meta.verified, netNPA: v.netNPA, grossNPA: v.grossNPA, pcr: v.pcr, source: v.source }
      : null;
  const latest = bank.npaQ2 ? mk(bank.npaQ2, { asOf: bank.npaQ2.asOf, label: bank.npaQ2.label, verified: true }) : null;
  const cur = mk({ netNPA: bank.netNPA, grossNPA: bank.grossNPA, pcr: bank.pcr, source: bank.npaSource }, curMeta);
  const prior = bank.npaPrior ? mk(bank.npaPrior, { asOf: bank.npaPrior.asOf, label: bank.npaPrior.label, verified: true }) : null;
  const history = [latest, cur, prior].filter(Boolean).sort((a, b) => new Date(b.asOf) - new Date(a.asOf));
  const idx = history.findIndex((v) => new Date(v.asOf) <= asOf);
  const pick = idx >= 0 ? history[idx] : null;
  const previous = pick ? history[idx + 1] || null : null;
  const earliest = history.length ? history[history.length - 1] : null;
  const penalties = bank.penalties.filter((p) => new Date(p.date) <= asOf);
  return {
    ...bank,
    penalties,
    hiddenPenaltyCount: bank.penalties.length - penalties.length,
    netNPA: pick ? pick.netNPA : null,
    grossNPA: pick ? pick.grossNPA : null,
    pcr: pick ? pick.pcr : null,
    npaSource: pick ? pick.source : null,
    npaMeta: pick
      ? { asOf: pick.asOf, label: pick.label, verified: pick.verified }
      : earliest
      ? { asOf: earliest.asOf, label: earliest.label, verified: earliest.verified }
      : curMeta,
    npaPrevious: previous,
    npaHiddenByYear: !!earliest && !pick,
    enforcementCovered: asOf >= PENALTY_COVERAGE_FULL_FROM,
  };
}

// Points deducted for a penalty of this size (before time-decay).
export function severityPoints(amount) {
  for (const [min, pts] of M.severityTiers) if (amount >= min) return pts;
  return M.severityTiers[M.severityTiers.length - 1][1];
}

// Breaks the Enforcement History score into its slices: how many of the 100
// starting points remain "clean", and how many each penalty deducted (already
// time-decayed). A fresh penalty reads darker than an old, mostly-decayed one.
export function enforcementBreakdown(penalties, asOf = TODAY) {
  let remaining = 100;
  const deductions = penalties.map((p) => {
    const age = monthsAgo(p.date, asOf);
    const decay = Math.max(0, 1 - age / M.decayMonths);
    const pts = severityPoints(p.amount) * decay;
    remaining -= pts;
    const dateLabel = new Date(p.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    return {
      label: `${p.label} (${dateLabel})`,
      value: pts,
      color: decay > 0.75 ? "#B23B2E" : decay > 0.35 ? "#C08A28" : "#D9C7A3",
    };
  });
  remaining = Math.max(0, remaining);
  const slices = [{ label: "Clean standing", value: remaining, color: "#3E6B52" }, ...deductions.filter((d) => d.value > 0.1)];
  return { score: Math.round(remaining), slices };
}

export function enforcementScore(penalties, asOf = TODAY) {
  return enforcementBreakdown(penalties, asOf).score;
}

export function healthScore(netNPA) {
  if (netNPA == null) return null;
  const s = 100 - (netNPA / M.healthNpaCeiling) * 100;
  return Math.max(0, Math.min(100, Math.round(s)));
}

// Kept visually separate from enforcement: how much of the 0–100 health budget
// is "clean margin" vs. eaten by NPA stress.
export function healthBreakdown(netNPA) {
  const score = healthScore(netNPA);
  if (score == null) return null;
  const stress = 100 - score;
  const stressColor = score >= 75 ? "#8AA6C2" : score >= 55 ? "#C08A28" : "#B23B2E";
  return {
    score,
    slices: [
      { label: "Clean margin", value: score, color: "#2F5E8C" },
      ...(stress > 0.1 ? [{ label: "NPA stress", value: stress, color: stressColor }] : []),
    ],
  };
}

// TREND — direction of travel, centred on 50 (50 = no change, above =
// improving, below = deteriorating). Two components: NPA movement between the
// two most recent reporting periods, and penalty severity in the last 12
// months vs the 12 before. A component that cannot be computed for the chosen
// date is dropped, never zero-filled, and Trend counts at reduced weight.
export function trendBreakdown(bank, asOf) {
  const T = M.trend;
  let npa = null;
  const prev = bank.npaPrevious;
  if (bank.netNPA != null && prev) {
    const dNet = bank.netNPA - prev.netNPA;
    const subs = [clamp100(50 - (dNet / T.netNpaSpan) * 50)];
    let dGross = null;
    if (bank.grossNPA != null && prev.grossNPA != null) {
      dGross = bank.grossNPA - prev.grossNPA;
      subs.push(clamp100(50 - (dGross / T.grossNpaSpan) * 50));
    }
    npa = { dNet, dGross, prevLabel: prev.label, score: Math.round(subs.reduce((a, b) => a + b, 0) / subs.length) };
  }

  let enf = null;
  if (monthsAgo(M.penaltyCoverageStart, asOf) >= T.minPenaltyHistoryMonths) {
    let recent = 0;
    let prior = 0;
    bank.penalties.forEach((p) => {
      const age = monthsAgo(p.date, asOf);
      const pts = severityPoints(p.amount);
      if (age >= 0 && age <= T.windowMonths) recent += pts;
      else if (age > T.windowMonths && age <= 2 * T.windowMonths) prior += pts;
    });
    enf = { recent, prior, score: Math.round(clamp100(50 + ((prior - recent) / T.penaltySwing) * 50)) };
  }

  const parts = [];
  if (npa) parts.push([npa.score, T.npaShare]);
  if (enf) parts.push([enf.score, T.enforcementShare]);
  if (parts.length === 0) return null;
  const share = parts.reduce((a, [, w]) => a + w, 0);
  const value = Math.round(parts.reduce((a, [sc, w]) => a + sc * w, 0) / share);
  return { value, coverage: T.coverageCap * share, npa, enf };
}

// Overall score: a weighted average of the dimensions that have data, with
// each dimension counting at weight × coverage. Missing dimensions are left out
// (never treated as zero) and reduce the confidence figure instead.
export function scoreBank(bank, asOf = TODAY) {
  const enfCovered = bank.enforcementCovered !== false;
  const enf = enfCovered ? enforcementScore(bank.penalties, asOf) : null;
  const hlt = healthScore(bank.netNPA);
  const trend = trendBreakdown(bank, asOf);
  const W = M.weights;

  const dims = [
    { key: "enforcement", label: LABEL.enforcement, weight: W.enforcement, coverage: 1, value: enf, available: enfCovered },
    { key: "health", label: LABEL.health, weight: W.health, coverage: 1, value: hlt, available: hlt != null },
    { key: "grievance", label: LABEL.grievance, weight: W.grievance, coverage: 1, value: null, available: false },
    { key: "disclosure", label: LABEL.disclosure, weight: W.disclosure, coverage: 1, value: null, available: false },
    { key: "kyc", label: LABEL.kyc, weight: W.kyc, coverage: 1, value: null, available: false },
    { key: "trend", label: LABEL.trend, weight: W.trend, coverage: trend ? trend.coverage : 0, value: trend ? trend.value : null, available: !!trend },
  ];

  const eff = (d) => d.weight * d.coverage;
  const availableWeight = dims.filter((d) => d.available).reduce((a, d) => a + eff(d), 0);
  const weightedSum = dims.filter((d) => d.available).reduce((a, d) => a + d.value * eff(d), 0);

  const overall = availableWeight > 0 ? Math.round(weightedSum / availableWeight) : null;
  const confidence = Math.round(availableWeight * 10) / 10; // out of 100: how much of the intended methodology has real data

  return { overall, confidence, dims, trend };
}
