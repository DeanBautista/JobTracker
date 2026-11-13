import { PAGE_SIZES } from "../../utils/jobOptions";

function PageButton({ current, disabled, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={current ? "page" : undefined}
      onClick={onClick}
      className={`inline-grid h-9 min-w-9 cursor-pointer place-items-center rounded-md border px-2.5 text-sm hover:border-ink disabled:pointer-events-none disabled:opacity-40 ${
        current ? "border-ink bg-ink text-on-ink" : "border-rule bg-surface text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export default function JobsFooter({ total, page, size, onPageChange, onSizeChange }) {
  const pageCount = Math.max(1, Math.ceil(total / size));
  const from = (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm text-muted max-sm:justify-center">
      <span>
        Showing {from}–{to} of {total} jobs
      </span>

      <nav aria-label="Pagination" className="flex gap-1.5">
        <PageButton disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</PageButton>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
          <PageButton key={n} current={n === page} onClick={() => onPageChange(n)}>{n}</PageButton>
        ))}
        <PageButton disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>Next</PageButton>
      </nav>

      <div className="flex items-center gap-2">
        <label htmlFor="page-size">Rows per page</label>
        <select
          id="page-size"
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="field min-h-9"
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
    </div>
  );
}