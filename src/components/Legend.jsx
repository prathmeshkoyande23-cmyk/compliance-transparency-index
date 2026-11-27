export function Legend({ slices }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9, minWidth: 0 }}>
      {slices
        .filter((s) => s.value > 0.1)
        .map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ flex: 1, color: "#3A4149", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {s.label}
            </span>
            <span style={{ fontVariantNumeric: "tabular-nums", color: "#8A909A", fontWeight: 600, flexShrink: 0 }}>
              {s.value.toFixed(1)}%
            </span>
          </div>
        ))}
    </div>
  );
}
