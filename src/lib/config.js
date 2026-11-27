// Methodology configuration. Every weight, threshold and scale used by the
// scoring engine lives here, so the method can be reviewed (and changed) in
// one place. docs/METHODOLOGY.md explains each value.

// The date treated as "now". The "Latest" view is as of this date.
export const DATA_AS_OF = "2026-11-27";

export const METHODOLOGY = {
  // Share of the full methodology each dimension carries.
  weights: { enforcement: 25, health: 20, grievance: 20, disclosure: 15, kyc: 10, trend: 10 },

  // Penalty severity: [minimum amount in rupees, points deducted]. First match wins.
  severityTiers: [
    [10_000_000, 35], // ₹1 crore and above
    [5_000_000, 22], // ₹50 lakh to ₹1 crore
    [1_000_000, 12], // ₹10 lakh to ₹50 lakh
    [0, 4], // under ₹10 lakh: operational-level penalties
  ],
  // A penalty's weight falls linearly to zero over this many months.
  decayMonths: 48,

  // Net NPA (%) at which the Prudential Health score reaches 0. 0% scores 100.
  healthNpaCeiling: 3.5,

  trend: {
    npaShare: 0.6, // share of the Trend score from NPA movement
    enforcementShare: 0.4, // share from penalty activity
    netNpaSpan: 0.2, // a ±0.20 pt change in net NPA spans the full 0–100 range
    grossNpaSpan: 0.5, // a ±0.50 pt change in gross NPA spans the full range
    penaltySwing: 35, // a 35-point swing in penalty severity spans the full range
    windowMonths: 12, // recent window; the prior window is the 12 months before it
    coverageCap: 0.5, // Trend counts at half weight (history is one quarter, not four)
    minPenaltyHistoryMonths: 23.5, // months of penalty coverage needed for the 12-vs-12 comparison
  },

  // The penalty list was compiled from Apr 2024 onward (plus notable older
  // orders). Before one full year of coverage exists, an empty penalty list
  // would read as "clean" when it means "not collected".
  penaltyCoverageStart: "2024-04-01",
  penaltyCoverageFullFrom: "2025-03-31",
};

export const PENALTY_COVERAGE_FULL_FROM = new Date(METHODOLOGY.penaltyCoverageFullFrom);

export const DIMENSION_LABELS = {
  enforcement: "Enforcement history",
  health: "Prudential health (NPA)",
  grievance: "Customer grievance signals",
  disclosure: "Disclosure completeness",
  kyc: "KYC/AML public indicators",
  trend: "Trend / trajectory",
};

// The "Data as of" filter. Each option is an as-of date applied to every
// dimension at once. grievanceFY picks which complaint disclosure is shown.
export const YEAR_OPTIONS = [
  { key: "latest", label: "Latest (Nov 2026)", asOf: DATA_AS_OF, grievanceFY: "FY2025-26" },
  { key: "FY2025-26", label: "FY2025-26 (to Mar 2026)", asOf: "2026-03-31", grievanceFY: "FY2025-26" },
  { key: "FY2024-25", label: "FY2024-25 (to Mar 2025)", asOf: "2025-03-31", grievanceFY: "FY2024-25" },
  { key: "FY2023-24", label: "FY2023-24 (to Mar 2024)", asOf: "2024-03-31", grievanceFY: null },
  { key: "FY2022-23", label: "FY2022-23 (to Mar 2023)", asOf: "2023-03-31", grievanceFY: null },
];

// Reporting period of each bank's "current" NPA figure (the Jun 2026 quarter).
// verified = the source named the period; otherwise it is an approximation and
// is labelled as such in the UI.
const NPA_Q1FY27 = { asOf: "2026-06-30", label: "Q1 FY27 (Jun 2026)", verified: true };
export const NPA_META = {
  sbi: NPA_Q1FY27, hdfc: NPA_Q1FY27, icici: NPA_Q1FY27, axis: NPA_Q1FY27, bom: NPA_Q1FY27,
  bob: NPA_Q1FY27, union: NPA_Q1FY27, central: NPA_Q1FY27, boi: NPA_Q1FY27, indusind: NPA_Q1FY27,
  kotak: NPA_Q1FY27, idfcfirst: NPA_Q1FY27, pnb: NPA_Q1FY27, bandhan: NPA_Q1FY27, canara: NPA_Q1FY27,
  yesbank: NPA_Q1FY27, federal: NPA_Q1FY27, idbi: NPA_Q1FY27, uco: NPA_Q1FY27, indianbank: NPA_Q1FY27,
};
export const NPA_META_DEFAULT = { asOf: "2026-03-31", label: "FY2026 (exact quarter to confirm)", verified: false };
export const npaMeta = (id) => NPA_META[id] || NPA_META_DEFAULT;
