import { useMemo, useState } from "react";
import { ConfidenceBadge } from "./components/ConfidenceBadge.jsx";
import { DimBar } from "./components/DimBar.jsx";
import { DonutChart } from "./components/DonutChart.jsx";
import { GrievanceCard } from "./components/GrievanceCard.jsx";
import { Legend } from "./components/Legend.jsx";
import { ScoreDial } from "./components/ScoreDial.jsx";
import { SourceLink } from "./components/SourceLink.jsx";
import { TrendCard } from "./components/TrendCard.jsx";
import { BANKS, DATASET } from "./data/index.js";
import { compositionSlices } from "./lib/charts.js";
import { YEAR_OPTIONS } from "./lib/config.js";
import { enforcementBreakdown, healthBreakdown, monthsAgo, scoreBank, viewBank } from "./lib/scoring.js";

export default function App() {
  const [yearKey, setYearKey] = useState("latest");
  const year = YEAR_OPTIONS.find((y) => y.key === yearKey);
  const asOf = useMemo(() => new Date(year.asOf), [year.asOf]);

  const scored = useMemo(() => {
    const withScores = BANKS.map((b) => {
      const v = viewBank(b, asOf);
      return { ...v, ...scoreBank(v, asOf) };
    });
    return withScores.sort((a, b) => (b.overall ?? -1) - (a.overall ?? -1));
  }, [asOf]);

  const [selectedId, setSelectedId] = useState(null);
  const selected = scored.find((b) => b.id === selectedId) || scored[0];
  const asOfLabel = asOf.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const cohortPeers = scored.filter((b) => b.cohort === selected.cohort);
  const cohortRank = cohortPeers.findIndex((b) => b.id === selected.id) + 1;

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        background: "#EEF0EC",
        minHeight: "100%",
        color: "#22262B",
        padding: 0,
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#101F33", padding: "28px 32px", borderBottom: "3px solid #C08A28" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#C08A28", fontWeight: 600, marginBottom: 6 }}>
              Phase 1 prototype — public regulatory data only
            </div>
            <h1 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", color: "#F4F3EE", fontSize: 28, fontWeight: 700, margin: 0 }}>
              Compliance Transparency Index
            </h1>
          </div>
          <div style={{ fontSize: 12, color: "#9AA6B8", maxWidth: 340, textAlign: "right" }}>
            {DATASET === "sample" ? "Illustrative sample data (fictional banks)" : `${BANKS.length} banks`} · scored on Enforcement History and Prudential Health from public sources.
            Three remaining dimensions (Grievance, Disclosure, KYC/AML) are not yet scored.
          </div>
        </div>
      </div>

      {/* Year filter */}
      <div
        style={{
          background: "#F4F3EE",
          borderBottom: "1px solid #DBD8CF",
          padding: "12px 32px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <label htmlFor="year-filter" style={{ fontSize: 12, fontWeight: 600, color: "#3A4149" }}>
          Data as of
        </label>
        <select
          id="year-filter"
          value={yearKey}
          onChange={(e) => setYearKey(e.target.value)}
          style={{
            fontSize: 13,
            padding: "6px 10px",
            border: "1px solid #C9C6BC",
            borderRadius: 4,
            background: "#FFFFFF",
            color: "#22262B",
          }}
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y.key} value={y.key}>
              {y.label}
            </option>
          ))}
        </select>
        <span style={{ fontSize: 12, color: "#8A909A" }}>
          Applies to Enforcement, Prudential Health and Grievance together.
        </span>
      </div>
      {yearKey !== "latest" && (
        <div style={{ background: "#FBF2E4", borderBottom: "1px solid #E9D6B0", padding: "10px 32px", fontSize: 12.5, color: "#7A5512", lineHeight: 1.5 }}>
          Showing the dataset as it stood on {asOfLabel}. A gap here means <strong>not collected for this period</strong>,
          not "clean". NPA figures are held for two or three reporting periods per bank (Mar and Jun 2026, plus Sep 2026 where the bank has reported), and penalty
          history is verified in full from Apr 2024 and only partly swept for 2023, so earlier years are intentionally sparse until more is pulled.
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
        {/* Sidebar — ledger list */}
        <div style={{ width: 320, minWidth: 280, borderRight: "1px solid #DBD8CF", background: "#F4F3EE" }}>
          {scored.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setSelectedId(b.id)}
              style={{
                width: "100%",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 20px",
                border: "none",
                borderBottom: "1px solid #E3E0D7",
                background: b.id === selected.id ? "#FFFFFF" : "transparent",
                borderLeft: b.id === selected.id ? "3px solid #C08A28" : "3px solid transparent",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 12, color: "#A3A9B1", width: 18, fontVariantNumeric: "tabular-nums" }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#22262B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {b.name}
                </div>
                <div style={{ fontSize: 11, color: "#8A909A" }}>{b.cohort}</div>
              </div>
              <div
                style={{
                  fontFamily: "'Source Serif Pro', Georgia, serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: b.overall == null ? "#B7BCC4" : b.overall >= 75 ? "#3E6B52" : b.overall >= 55 ? "#C08A28" : "#B23B2E",
                }}
              >
                {b.overall ?? "—"}
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, minWidth: 340, padding: "32px", background: "#EEF0EC" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24, marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 12, color: "#8A909A", fontWeight: 600, marginBottom: 4 }}>{selected.cohort}</div>
              <h2 style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: 26, margin: "0 0 10px 0" }}>{selected.name}</h2>
              <ConfidenceBadge confidence={selected.confidence} />
            </div>
            <div style={{ textAlign: "right" }}>
              <ScoreDial value={selected.overall} />
              <div style={{ fontSize: 12, color: "#8A909A", marginTop: 4 }}>
                Rank {cohortRank} of {cohortPeers.length} in {selected.cohort}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {/* Score breakdown */}
            <div style={{ flex: "1 1 340px", background: "#FFFFFF", border: "1px solid #DBD8CF", borderRadius: 6, padding: "22px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#22262B", marginBottom: 16, textTransform: "none" }}>
                Score breakdown
              </div>

              {selected.confidence > 0 && (
                <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 20, paddingBottom: 18, borderBottom: "1px solid #EEECE4" }}>
                  <DonutChart
                    slices={compositionSlices(selected.dims)}
                    size={104}
                    centerLabel={`${selected.confidence}`}
                    centerSub="of 100 wt."
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, color: "#8A909A", marginBottom: 8, lineHeight: 1.4 }}>
                      Share of the overall score contributed by each scored dimension, weighted
                    </div>
                    <Legend slices={compositionSlices(selected.dims)} />
                  </div>
                </div>
              )}

              {selected.dims.map((d) => (
                <DimBar key={d.key} dim={d} />
              ))}
              <div style={{ fontSize: 11, color: "#A3A9B1", marginTop: 6, borderTop: "1px solid #EEECE4", paddingTop: 10 }}>
                Overall score is a weighted average of available dimensions only, renormalized —
                it does not assume a value for missing data.
              </div>
            </div>

            {/* Asset quality + enforcement detail */}
            <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #DBD8CF", borderRadius: 6, padding: "22px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                  Asset quality <span style={{ fontWeight: 400, color: "#A3A9B1" }}>— separate from enforcement</span>
                </div>
                {selected.netNPA == null ? (
                  <div style={{ fontSize: 13, color: "#A3A9B1", lineHeight: 1.5 }}>
                    {selected.npaHiddenByYear
                      ? `This bank's NPA figure is for ${selected.npaMeta.label}, which is after the selected date. No earlier NPA figure has been collected.`
                      : "Net NPA not sourced for this bank yet."}
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 18, paddingBottom: 16, borderBottom: "1px solid #EEECE4" }}>
                      <DonutChart
                        slices={healthBreakdown(selected.netNPA).slices}
                        size={92}
                        centerLabel={`${healthBreakdown(selected.netNPA).score}`}
                        centerSub="/ 100"
                      />
                      <Legend slices={healthBreakdown(selected.netNPA).slices} />
                    </div>
                    <div style={{ display: "flex", gap: 28 }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{selected.netNPA}%</div>
                        <div style={{ fontSize: 11, color: "#8A909A" }}>
                          Net NPA {selected.npaEstimated ? "(estimated from gross)" : ""}
                        </div>
                      </div>
                      {selected.grossNPA != null && (
                        <div>
                          <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{selected.grossNPA}%</div>
                          <div style={{ fontSize: 11, color: "#8A909A" }}>Gross NPA</div>
                        </div>
                      )}
                      {selected.pcr != null && (
                        <div>
                          <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{selected.pcr}%</div>
                          <div style={{ fontSize: 11, color: "#8A909A" }}>Provision coverage</div>
                        </div>
                      )}
                    </div>
                    {selected.npaPrevious && (
                      <div style={{ fontSize: 12, color: "#5B6472", marginTop: 14 }}>
                        <span style={{ fontWeight: 600 }}>vs {selected.npaPrevious.label}:</span>{" "}
                        {[
                          ["Net", selected.netNPA - selected.npaPrevious.netNPA],
                          ...(selected.grossNPA != null && selected.npaPrevious.grossNPA != null
                            ? [["Gross", selected.grossNPA - selected.npaPrevious.grossNPA]]
                            : []),
                        ].map(([lbl, d], i) => (
                          <span key={lbl} style={{ marginRight: 12, color: Math.abs(d) < 0.005 ? "#8A909A" : d < 0 ? "#3E6B52" : "#B23B2E", fontWeight: 600 }}>
                            {lbl} {d > 0.004 ? "+" : ""}{Math.abs(d) < 0.005 ? "0.00" : d.toFixed(2)} pts
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "#A3A9B1", marginTop: 14 }}>
                      Reporting period: {selected.npaMeta.label}
                      {selected.npaMeta.verified ? "" : " — approximate, period not confirmed by source"}
                      {monthsAgo(selected.npaMeta.asOf, asOf) > 12 && (
                        <span style={{ color: "#B23B2E", fontWeight: 600 }}> · stale (over 12 months old)</span>
                      )}
                    </div>
                    <SourceLink source={selected.npaSource} />
                  </>
                )}
              </div>

              <div style={{ background: "#FFFFFF", border: "1px solid #DBD8CF", borderRadius: 6, padding: "22px 24px", flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                  Enforcement history <span style={{ fontWeight: 400, color: "#A3A9B1" }}>— penalties by financial regulators</span>{" "}
                  {selected.penalties.length > 0 && `(${selected.penalties.length})`}
                </div>
                {selected.hiddenPenaltyCount > 0 && (
                  <div style={{ fontSize: 11.5, color: "#A3A9B1", marginTop: -8, marginBottom: 12 }}>
                    {selected.hiddenPenaltyCount} later order(s) not shown — dated after the selected year.
                  </div>
                )}
                {!selected.enforcementCovered ? (
                  <div style={{ fontSize: 13, color: "#A3A9B1", lineHeight: 1.5 }}>
                    Penalty history for this period has not been collected, so it is shown as a gap rather than a
                    clean record.
                  </div>
                ) : selected.penalties.length === 0 ? (
                  <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                    <DonutChart
                      slices={[{ label: "Clean standing", value: 100, color: "#3E6B52" }]}
                      size={88}
                      centerLabel="100"
                      centerSub="clean"
                    />
                    <div style={{ fontSize: 13, color: "#8A909A", lineHeight: 1.5 }}>
                      No regulatory monetary penalty (RBI, FIU-IND, IRDAI) found in the sources checked for this bank. The search was not
                      exhaustive, so this is not proof of a clean record.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", gap: 18, alignItems: "center", paddingBottom: 14, borderBottom: "1px solid #EEECE4" }}>
                      <DonutChart
                        slices={enforcementBreakdown(selected.penalties, asOf).slices}
                        size={104}
                        centerLabel={`${enforcementBreakdown(selected.penalties, asOf).score}`}
                        centerSub="/ 100"
                      />
                      <Legend slices={enforcementBreakdown(selected.penalties, asOf).slices} />
                    </div>
                    {selected.penalties.map((p, idx) => (
                      <div key={idx} style={{ borderLeft: "2px solid #C08A28", paddingLeft: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
                          <span>
                            {p.label}
                            {p.regulator && p.regulator !== "RBI" && (
                              <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 600, color: "#2F5E8C", background: "#E8EEF5", borderRadius: 3, padding: "1px 6px" }}>
                                {p.regulator}
                              </span>
                            )}
                          </span>
                          <span style={{ color: "#8A909A", fontWeight: 400 }}>
                            {new Date(p.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <div style={{ fontSize: 12.5, color: "#5B6472", marginTop: 3, lineHeight: 1.4 }}>{p.reason}</div>
                        <SourceLink source={p.source} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <TrendCard bank={selected} />

          <GrievanceCard bank={selected} fy={year.grievanceFY} />

          <div
            style={{
              marginTop: 24,
              fontSize: 11.5,
              color: "#8A909A",
              background: "#F4F3EE",
              border: "1px solid #DBD8CF",
              borderRadius: 6,
              padding: "14px 18px",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "#5B6472" }}>Methodology note:</strong> Enforcement History score starts at 100
            and deducts points per penalty, scaled by severity (₹1Cr and above: −35, ₹50L–1Cr: −22, ₹10L–50L: −12, under ₹10L: −4) and
            decayed linearly to zero over 48 months. Prudential Health score maps Net NPA on a 0–3.5% scale to
            0–100. Overall score is a confidence-weighted average of only the dimensions with real data — Grievance
            Signals, Disclosure Completeness and KYC/AML-specific indicators are not yet wired to a live source and
            are shown as gaps, not zeros. <strong style={{ color: "#5B6472" }}>Trend</strong> (50 = no change) blends
            NPA movement between the two held quarters (60%) with penalty severity points in the last 12 vs the prior
            12 months (40%); it counts at half weight because the NPA history is one quarter, not four. Figures compiled from RBI penalty orders and bank/financial-press
            disclosures, Aug–Nov 2026. <strong style={{ color: "#5B6472" }}>Penalties</strong> include RBI and other financial regulators (FIU-IND, IRDAI) that penalised the bank itself, at the same severity tiers. Tax assessments, penalties on subsidiaries or insurers, and stock-exchange fines are excluded. Dates are the announcement or disclosure date.
            The penalty list is compiled from RBI releases and press coverage and is not guaranteed complete (verified in full from Apr 2024; Apr 2023–Mar 2024 only partly swept; earlier not swept); every
            entry links to its source. <strong style={{ color: "#5B6472" }}>Year filter:</strong> penalties dated
            after the chosen date are excluded and decay is measured from that date; an NPA figure appears only if
            its reporting period ended on or before it; grievance shows the matching financial year's disclosure.
          </div>
        </div>
      </div>
    </div>
  );
}
