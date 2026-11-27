export function DonutChart({ slices, size = 120, centerLabel, centerSub }) {
  let cumulative = 0;
  const visible = slices.filter((s) => s.value > 0.05);
  const stops = visible
    .map((s) => {
      const start = cumulative;
      cumulative += s.value;
      return `${s.color} ${start}% ${cumulative}%`;
    })
    .join(", ");
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: `conic-gradient(${stops})` }} />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: size * 0.62,
          height: size * 0.62,
          borderRadius: "50%",
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div style={{ fontSize: size * 0.18, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#22262B" }}>
          {centerLabel}
        </div>
        {centerSub && <div style={{ fontSize: size * 0.085, color: "#8A909A" }}>{centerSub}</div>}
      </div>
    </div>
  );
}
