export function DimBar({ dim }) {
  const pct = dim.available ? dim.value : 0;
  let barColor = "#C7CCD3";
  if (dim.available) {
    // Trend is centred on 50 ("no change"), so it uses its own thresholds.
    barColor =
      dim.key === "trend"
        ? dim.value >= 58 ? "#3E6B52" : dim.value <= 42 ? "#B23B2E" : "#8A909A"
        : dim.value >= 75 ? "#3E6B52" : dim.value >= 55 ? "#C08A28" : "#B23B2E";
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "#3A4149", fontWeight: 600 }}>{dim.label}</span>
        <span style={{ fontSize: 13, color: dim.available ? "#3A4149" : "#A3A9B1", fontVariantNumeric: "tabular-nums" }}>
          {dim.available ? dim.value : "not integrated"}
        </span>
      </div>
      <div style={{ height: 7, background: "#E7E5DE", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: dim.available ? `${pct}%` : "0%",
            background: barColor,
            borderRadius: 4,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: "#A3A9B1", marginTop: 3 }}>{dim.weight}% weight in full methodology
        {dim.available && (dim.coverage ?? 1) < 1 ? ` · counts at ${Math.round(dim.coverage * 100)}% (partial data)` : ""}
      </div>
    </div>
  );
}
