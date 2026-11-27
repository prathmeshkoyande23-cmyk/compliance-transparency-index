// Fixed identity color per dimension — independent of score — so a slice
// always means the same dimension across every chart in the app. Enforcement
// and Health deliberately don't share a hue (gold vs. blue), matching the
// color families already used in their own individual donuts.
export const DIM_COLORS = {
  enforcement: "#C08A28", // gold — matches the enforcement donut's identity
  health: "#2F5E8C", // blue — matches the asset quality donut's identity
  grievance: "#6B4C9A", // purple — reserved for when this dimension goes live
  disclosure: "#3E6B52", // green — reserved
  kyc: "#B23B2E", // red — reserved
  trend: "#5B6472", // slate — reserved
};

// Slices representing how much of the overall score's available weight each
// scored dimension contributes — e.g. with only Enforcement (25%) and Health
// (20%) live, this shows the 25/45 vs 20/45 split. Colored by dimension
// identity (not score), so Enforcement and NPA are always visually distinct.
export function compositionSlices(dims) {
  const available = dims.filter((d) => d.available);
  const effW = (d) => d.weight * (d.coverage ?? 1);
  const totalWeight = available.reduce((a, d) => a + effW(d), 0);
  if (totalWeight === 0) return [];
  return available.map((d) => ({
    label: `${d.label} (${d.value})`,
    value: (effW(d) / totalWeight) * 100,
    color: DIM_COLORS[d.key] || "#8A909A",
  }));
}
