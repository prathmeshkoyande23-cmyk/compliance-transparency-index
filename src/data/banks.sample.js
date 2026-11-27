// ILLUSTRATIVE SAMPLE DATA. These banks, figures, penalties and links are
// fictional and exist only to show the data format and to let the app run
// without the compiled dataset. Do not read anything into them.
//
// This file doubles as the schema reference: every field the app understands
// appears at least once below.

const SOURCE = (label, path) => ({ label, url: `https://example.com/${path}` });

export const BANKS = [
  {
    id: "alpha",
    name: "Alpha National Bank",
    cohort: "PSU — Large",
    // Latest reported quarter (Jun 2026). npaCurrent says which period that is.
    netNPA: 0.4,
    grossNPA: 1.9,
    npaEstimated: false,
    pcr: 92.0,
    npaSource: SOURCE("Example results release, Q1 FY27", "alpha-q1"),
    npaCurrent: { asOf: "2026-06-30", label: "Q1 FY27 (Jun 2026)", verified: true },
    // Prior quarter, used for the "change since" line and the Trend dimension.
    npaPrior: { asOf: "2026-03-31", label: "Q4 FY26 (Mar 2026)", netNPA: 0.45, grossNPA: 2.1, pcr: null, source: SOURCE("Example results release, Q4 FY26", "alpha-q4") },
    // Optional newest quarter (Sep 2026) for banks that have already reported.
    npaQ2: { asOf: "2026-09-30", label: "Q2 FY27 (Sep 2026)", netNPA: 0.36, grossNPA: 1.7, pcr: null, source: SOURCE("Example results release, Q2 FY27", "alpha-q2") },
    penalties: [
      { date: "2024-08-10", regulator: "RBI", amount: 12000000, label: "₹1.2 crore", reason: "Illustrative: KYC record-keeping lapse", source: SOURCE("Example RBI release", "rbi-1") },
      { date: "2025-11-14", regulator: "RBI", amount: 3500000, label: "₹35 lakh", reason: "Illustrative: customer service directions", source: SOURCE("Example exchange filing", "filing-1") },
    ],
    // Optional complaint disclosure, shown but not yet scored.
    grievance: {
      "FY2025-26": {
        fy: "FY2025-26",
        source: SOURCE("Example complaint disclosure", "alpha-complaints"),
        openingPending: 4000,
        received: 90000,
        disposed: 91000,
        rejected: 8000,
        closingPending: 3000,
        pendingOver30: 600,
        obComplaints: 900,
        awardsAgainst: 2,
        awardsUnimplemented: 0,
        yoyReceivedPct: -4.2,
        prev: { received: 94000, disposed: 93500, rejected: 7000, pendingOver30: 450, obComplaints: 870 },
        topGrounds: [
          { name: "Internet / mobile banking", received: 41000, over30: 350 },
          { name: "ATM / debit cards", received: 22000, over30: 120 },
          { name: "Operation of accounts", received: 9000, over30: 60 },
        ],
      },
    },
  },
  {
    id: "beacon",
    name: "Beacon Private Bank",
    cohort: "Private — Large",
    netNPA: 0.3,
    grossNPA: 1.2,
    npaEstimated: false,
    pcr: 78.0,
    npaSource: SOURCE("Example results release, Q1 FY27", "beacon-q1"),
    npaCurrent: { asOf: "2026-06-30", label: "Q1 FY27 (Jun 2026)", verified: true },
    npaPrior: { asOf: "2026-03-31", label: "Q4 FY26 (Mar 2026)", netNPA: 0.31, grossNPA: 1.25, pcr: null, source: SOURCE("Example results release, Q4 FY26", "beacon-q4") },
    penalties: [
      { date: "2026-03-02", regulator: "RBI", amount: 7500000, label: "₹75 lakh", reason: "Illustrative: KYC non-compliance", source: SOURCE("Example RBI release", "rbi-2") },
      // Penalties by other financial regulators carry their own regulator tag.
      { date: "2026-07-20", regulator: "IRDAI", amount: 10000000, label: "₹1 crore", reason: "Illustrative: bancassurance grievance handling", source: SOURCE("Example exchange filing", "filing-2") },
    ],
  },
  {
    id: "crest",
    name: "Crest Finance Bank",
    cohort: "Private — Mid",
    netNPA: 1.1,
    grossNPA: 3.2,
    npaEstimated: false,
    pcr: null,
    npaSource: SOURCE("Example results release, Q1 FY27", "crest-q1"),
    npaCurrent: { asOf: "2026-06-30", label: "Q1 FY27 (Jun 2026)", verified: true },
    npaPrior: { asOf: "2026-03-31", label: "Q4 FY26 (Mar 2026)", netNPA: 1.0, grossNPA: 3.1, pcr: null, source: SOURCE("Example results release, Q4 FY26", "crest-q4") },
    // No penalty found in the sources checked. This is "none found", not a
    // verified clean record, and the UI says so.
    penalties: [],
  },
  {
    id: "delta",
    name: "Delta Regional Bank",
    cohort: "PSU — Mid",
    netNPA: 0.55,
    grossNPA: 2.4,
    npaEstimated: false,
    pcr: 95.0,
    npaSource: SOURCE("Example results release, Q1 FY27", "delta-q1"),
    npaCurrent: { asOf: "2026-06-30", label: "Q1 FY27 (Jun 2026)", verified: true },
    npaPrior: { asOf: "2026-03-31", label: "Q4 FY26 (Mar 2026)", netNPA: 0.6, grossNPA: 2.6, pcr: null, source: SOURCE("Example results release, Q4 FY26", "delta-q4") },
    npaQ2: { asOf: "2026-09-30", label: "Q2 FY27 (Sep 2026)", netNPA: 0.5, grossNPA: 2.3, pcr: null, source: SOURCE("Example results release, Q2 FY27", "delta-q2") },
    penalties: [
      // Amounts are in rupees. Under ₹10 lakh counts as an operational-level penalty.
      { date: "2023-10-05", regulator: "RBI", amount: 25000000, label: "₹2.5 crore", reason: "Illustrative: older penalty, mostly decayed", source: SOURCE("Example RBI release", "rbi-3") },
      { date: "2026-09-01", regulator: "FIU-IND", amount: 400000, label: "₹4 lakh", reason: "Illustrative: reporting lapse", source: null },
    ],
  },
];
