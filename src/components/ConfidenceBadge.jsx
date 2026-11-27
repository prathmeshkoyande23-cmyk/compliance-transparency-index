export function ConfidenceBadge({ confidence }) {
  let tone = "low";
  if (confidence >= 40) tone = "high";
  else if (confidence >= 25) tone = "mid";
  const toneStyles = {
    high: { bg: "#EFF3EC", fg: "#3E6B52", dot: "#3E6B52" },
    mid: { bg: "#FBF2E4", fg: "#8A5E15", dot: "#C08A28" },
    low: { bg: "#F7EBEA", fg: "#8C3A2E", dot: "#B23B2E" },
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 999,
        background: toneStyles.bg,
        color: toneStyles.fg,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.2,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: toneStyles.dot }} />
      {confidence}/100 data coverage
    </span>
  );
}
