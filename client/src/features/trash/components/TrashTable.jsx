import TrashRow from "./TrashRow";

const thBase =
  "border-b border-rule bg-tint px-2.5 py-[11px] text-left font-mono text-[11px] leading-[1.2] font-medium tracking-[0.06em] whitespace-nowrap text-muted uppercase";

export default function TrashTable({ view, jobs, selection, actions, onPurge }) {
  const isTrash = view === "trash";

  return (
    <div className="tbl:relative tbl:overflow-x-auto tbl:rounded-lg tbl:border tbl:border-rule tbl:bg-surface">
      {/* The header row is hidden on mobile, so select-all lives here instead. */}
      <label className="mb-2.5 flex cursor-pointer items-center gap-2.5 px-1 font-mono text-xs tracking-[0.06em] text-muted uppercase tbl:hidden">
        <input
          type="checkbox"
          checked={selection.allSelected}
          onChange={selection.toggleAll}
          className="m-0 size-5 cursor-pointer accent-accent"
        />
        Select all
      </label>

      <table
        aria-label={isTrash ? "Deleted jobs" : "Archived jobs"}
        className="block w-full border-collapse text-sm tbl:table tbl:min-w-[680px]"
      >
        <thead className="hidden tbl:table-header-group">
          <tr>
            <th className={`${thBase} w-11 pr-0`}>
              <input
                type="checkbox"
                checked={selection.allSelected}
                onChange={selection.toggleAll}
                aria-label="Select all on this page"
                className="m-0 size-[17px] cursor-pointer accent-accent"
              />
            </th>
            <th scope="col" className={thBase}>Job</th>
            <th scope="col" className={thBase}>Stage</th>
            <th scope="col" className={thBase}>{isTrash ? "Deleted" : "Archived"}</th>
            {isTrash && <th scope="col" className={thBase}>Days left</th>}
            <th className={thBase}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody className="block tbl:table-row-group">
          {jobs.map((job) => (
            <TrashRow
              key={job.id}
              job={job}
              view={view}
              selected={selection.selected.has(job.id)}
              onToggle={() => selection.toggle(job.id)}
              actions={actions}
              onPurge={onPurge}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
