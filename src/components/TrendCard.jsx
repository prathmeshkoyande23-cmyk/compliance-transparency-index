// Trend detail: how the dimension's score was built, and why it is only
// partly counted. 50 means "no change".
export function TrendCard({ bank }) {
  const t = bank.trend;
  const pts = (v) => `${v > 0.004 ? "+" : ""}${Math.abs(v) < 0.005 ? "0.00" : v.toFixed(2)} pts`;
  const tone = (v) => (Math.abs(v) < 0.005 ? "#8A909A" : v < 0 ? "#3E6B52" : "#B23B2E");
  const verdict = (s) => (s >= 58 ? "Improving" : s <= 42 ? "Deteriorating" : "Broadly steady");
  const verdictColor = (s) => (s >= 58 ? "#3E6B52" : s <= 42 ? "#B23B2E" : "#8A909A");
  return (
    <div style={{ marginTop: 24, background: "#FFFFFF", border: "1px solid #DBD8CF", borderRadius: 6, padding: "22px 24px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
        Trend <span style={{ fontWeight: 400, color: "#A3A9B1" }}>— direction of travel, 50 = no change</span>
      </div>
      {!t ? (
        <div style={{ fontSize: 13, color: "#8A909A", lineHeight: 1.5 }}>
          Trend needs two NPA reporting periods on or before the selected date, or 24 months of penalty coverage.
          Neither is available for this date, so it is shown as a gap.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18 }}>
            <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: 40, fontWeight: 700, color: verdictColor(t.value), fontVariantNumeric: "tabular-nums" }}>
              {t.value}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: verdictColor(t.value) }}>{verdict(t.value)}</div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 28, marginBottom: 16 }}>
            {t.npa && (
              <div style={{ flex: "1 1 220px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#3A4149", marginBottom: 8 }}>
                  NPA movement <span style={{ fontWeight: 400, color: "#A3A9B1" }}>· 60% of trend · score {t.npa.score}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: tone(t.npa.dNet), fontVariantNumeric: "tabular-nums" }}>
                  Net {pts(t.npa.dNet)}
                </div>
                {t.npa.dGross != null && (
                  <div style={{ fontSize: 15, fontWeight: 700, color: tone(t.npa.dGross), fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
                    Gross {pts(t.npa.dGross)}
                  </div>
                )}
                <div style={{ fontSize: 11, color: "#A3A9B1", marginTop: 4 }}>since {t.npa.prevLabel}</div>
              </div>
            )}
            {t.enf && (
              <div style={{ flex: "1 1 220px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#3A4149", marginBottom: 8 }}>
                  Penalty activity <span style={{ fontWeight: 400, color: "#A3A9B1" }}>· 40% of trend · score {t.enf.score}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: tone(t.enf.recent - t.enf.prior), fontVariantNumeric: "tabular-nums" }}>
                  {t.enf.recent} vs {t.enf.prior} severity pts
                </div>
                <div style={{ fontSize: 11, color: "#A3A9B1", marginTop: 4 }}>last 12 months vs the 12 before</div>
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#A3A9B1", lineHeight: 1.5, borderTop: "1px solid #EEECE4", paddingTop: 10 }}>
            Counts at {Math.round(t.coverage * 100)}% weight. NPA movement spans one quarter, not the four the
            methodology calls for, and the penalty list is not exhaustive. A component that cannot be computed for
            the selected date is dropped, not scored as zero.
          </div>
        </>
      )}
    </div>
  );
}
