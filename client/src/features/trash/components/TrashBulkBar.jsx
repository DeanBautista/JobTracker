export default function TrashBulkBar({ view, count, actions, selectedIds, onPurge, onClear }) {
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="animate-rise sticky bottom-[72px] z-12 mt-4 flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-[10px] border border-ink bg-surface px-3.5 py-2.5 shadow-float sm:bottom-4"
    >
      <span aria-live="polite" className="text-sm font-semibold">{count} selected</span>

      {view === "trash" ? (
        <>
          <button type="button" onClick={() => actions.restore(selectedIds)} className="btn btn-sm">Restore</button>
          <button type="button" onClick={() => onPurge(selectedIds)} className="btn btn-sm btn-danger">Delete forever</button>
        </>
      ) : (
        <>
          <button type="button" onClick={() => actions.unarchive(selectedIds)} className="btn btn-sm">Unarchive</button>
          <button type="button" onClick={() => actions.trash(selectedIds)} className="btn btn-sm btn-danger">Delete</button>
        </>
      )}

      <button type="button" onClick={onClear} className="link ml-auto cursor-pointer text-[13px]">Clear</button>
    </div>
  );
}
