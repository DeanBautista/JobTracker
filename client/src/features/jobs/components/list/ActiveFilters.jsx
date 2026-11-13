import ColumnsMenu from "./ColumnsMenu";

export default function ActiveFilters({
  activeFilters, onRemove, onClear, visibleColumns, onToggleColumn,
}) {
  return (
    <div
      aria-live="polite"
      className="mt-3 mb-4 flex min-h-[30px] flex-wrap items-center gap-2 text-[13.5px] text-muted"
    >
      {activeFilters.length === 0 ? (
        <span>No filters active</span>
      ) : (
        <span className="flex flex-wrap items-center gap-2">
          {activeFilters.map(({ key, text }) => (
            <span
              key={key}
              className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-ink bg-surface pr-1.5 pl-2.5 text-[13px] font-medium text-ink"
            >
              {text}
              <button
                type="button"
                onClick={() => onRemove(key)}
                aria-label={`Remove filter ${text}`}
                className="grid size-5 cursor-pointer place-items-center rounded-full leading-none text-muted hover:bg-tint hover:text-ink"
              >
                ×
              </button>
            </span>
          ))}
          <button type="button" onClick={onClear} className="link cursor-pointer text-[13px]">
            Clear all
          </button>
        </span>
      )}

      <span className="flex w-full items-center justify-between gap-2.5 tbl:ml-auto tbl:w-auto tbl:justify-start">
        <ColumnsMenu visible={visibleColumns} onToggle={onToggleColumn} />
        <a href="/jobs.csv" className="btn btn-sm">Export CSV</a>
      </span>
    </div>
  );
}