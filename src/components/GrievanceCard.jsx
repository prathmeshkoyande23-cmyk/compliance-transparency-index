import { SourceLink } from "./SourceLink.jsx";

// Raw grievance metrics from the bank's own annual complaint disclosure.
// Deliberately NOT turned into a score yet: with one bank pulled there is no
// peer cohort to calibrate thresholds against, and banks count complaints
// differently, so a score now would be invented precision.
export function GrievanceCard({ bank, fy }) {
  const g = fy && bank.grievance ? bank.grievance[fy] : null;
  const n = (v) => v.toLocaleString("en-IN");
  const pct = (a, b) => (b > 0 ? (a / b) * 100 : null);
  const fmt = (v) => (v == null ? "—" : v.toFixed(2) + "%");
  const Tile = ({ label, value, sub }) => (
    <div style={{ flex: "1 1 150px", minWidth: 140 }}>
      <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "#5B6472", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#A3A9B1", marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ marginTop: 24, background: "#FFFFFF", border: "1px solid #DBD8CF", borderRadius: 6, padding: "22px 24px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
        Customer grievance disclosure <span style={{ fontWeight: 400, color: "#A3A9B1" }}>— shown, not yet scored</span>
      </div>
      {!g ? (
        <div style={{ fontSize: 13, color: "#8A909A", lineHeight: 1.5 }}>
          {fy
            ? `No ${fy} complaint disclosure has been pulled for this bank yet. `
            : "No complaint disclosure has been collected for the selected year. "}
          Banks publish this table (complaints received, disposed, pending beyond 30 days, Ombudsman escalations,
          awards) on their websites and in annual reports.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 18 }}>
            <Tile
              label={`Complaints received (${g.fy})`}
              value={n(g.received)}
              sub={`${g.yoyReceivedPct > 0 ? "+" : ""}${g.yoyReceivedPct}% vs prior year (as disclosed)`}
            />
            <Tile
              label="Disposal rate"
              value={fmt(pct(g.disposed, g.openingPending + g.received))}
              sub="disposed ÷ (opening + received)"
            />
            <Tile
              label="Pending beyond 30 days"
              value={n(g.pendingOver30)}
              sub={`${fmt(pct(g.pendingOver30, g.received))} of received${g.prev ? `; prior year ${fmt(pct(g.prev.pendingOver30, g.prev.received))}` : ""}`}
            />
            <Tile
              label="Ombudsman escalation ratio"
              value={fmt(pct(g.obComplaints, g.received))}
              sub={g.prev ? `prior year ${fmt(pct(g.prev.obComplaints, g.prev.received))}` : "prior-year comparison not collected"}
            />
            <Tile
              label="Rejected by bank"
              value={fmt(pct(g.rejected, g.disposed))}
              sub={`of disposed${g.prev ? `; prior year ${fmt(pct(g.prev.rejected, g.prev.disposed))}` : ""}`}
            />
            <Tile
              label="Ombudsman awards against bank"
              value={`${g.awardsAgainst}`}
              sub={`${g.awardsUnimplemented} unimplemented`}
            />
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: "#3A4149", marginBottom: 8 }}>Top five grounds</div>
          {g.topGrounds.map((t) => (
            <div key={t.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "5px 0", borderBottom: "1px solid #F0EEE7" }}>
              <span style={{ color: "#3A4149" }}>{t.name}</span>
              <span style={{ color: "#8A909A", fontVariantNumeric: "tabular-nums" }}>
                {n(t.received)} received · {n(t.over30)} pending &gt;30d
              </span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: "#A3A9B1", marginTop: 12, lineHeight: 1.5 }}>
            Source: bank's own annual complaint disclosure. Banks define and count complaints differently (some net
            out same-day or duplicate complaints), so cross-bank comparison needs normalization before this can be
            scored.
          </div>
          <SourceLink source={g.source} />
        </>
      )}
    </div>
  );
}
