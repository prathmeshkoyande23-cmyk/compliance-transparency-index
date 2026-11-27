export function ScoreDial({ value }) {
  if (value == null) {
    return (
      <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: 56, color: "#B7BCC4" }}>
        —
      </div>
    );
  }
  let color = "#B23B2E";
  if (value >= 75) color = "#3E6B52";
  else if (value >= 55) color = "#C08A28";
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <div style={{ fontFamily: "'Source Serif Pro', Georgia, serif", fontSize: 56, color, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
      <div style={{ fontSize: 15, color: "#7A828E" }}>/ 100</div>
    </div>
  );
}
