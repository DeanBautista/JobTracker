export default function CardStatus({ status, onRetry, label, children }) {
  if (status === "loading") {
    return <p className="text-sm text-muted">Loading {label}…</p>;
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-danger">Couldn't load {label}.</span>
        <button type="button" className="btn btn-sm" onClick={onRetry}>
          Retry
        </button>
      </div>
    );
  }

  return children;
}