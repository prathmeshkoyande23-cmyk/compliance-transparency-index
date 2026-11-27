// Link to the page a data point came from. A missing link is shown as such,
// never hidden — an unverified figure should look unverified.
export function SourceLink({ source }) {
  if (!source) {
    return <div style={{ fontSize: 11, color: "#B0A58F", marginTop: 4 }}>Source link pending verification</div>;
  }
  return (
    <div style={{ fontSize: 11, marginTop: 4 }}>
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#2F5E8C", textDecoration: "underline" }}
      >
        {source.label} ↗
      </a>
    </div>
  );
}
