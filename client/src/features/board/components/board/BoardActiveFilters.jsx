export default function BoardActiveFilters({ activeFilters, onRemove, onClear }) {
  if (activeFilters.length === 0) return null;
  return (
    <div aria-live="polite" className="mb-4 flex flex-wrap items-center gap-2 text-[13.5px] text-muted">
      <span>Filters:</span>
      {activeFilters.map((f) => (
        <span
          key={f.id}
          className="inline-flex min-h-7 items-center gap-1 rounded-full border border-ink bg-surface pr-1 pl-2.5 text-[13px] font-medium text-ink"
        >
          {f.label}
          <button
            type="button"
            onClick={() => onRemove(f)}
            aria-label={`Remove filter ${f.label}`}
            className="grid size-6 cursor-pointer place-items-center rounded-full hover:bg-tint"
          >
            <span aria-hidden="true">×</span>
          </button>
        </span>
      ))}
      <button type="button" onClick={onClear} className="link cursor-pointer">Clear filters</button>
    </div>
  );
}
