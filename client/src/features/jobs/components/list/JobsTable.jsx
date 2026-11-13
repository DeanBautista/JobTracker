import JobRow from "./JobRow";

const thBase =
  "border-b border-rule bg-tint px-2.5 py-[11px] text-left font-mono text-[11px] leading-[1.2] font-medium tracking-[0.06em] whitespace-nowrap text-muted uppercase";

function SortButton({ sortKey, activeSort, dir, onSort, children }) {
  const active = activeSort === sortKey;
  const arrow = active ? (dir === "asc" ? "↑" : "↓") : "↕";

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="inline-flex cursor-pointer items-center gap-[5px] uppercase hover:text-ink"
    >
      {children} <span aria-hidden="true">{arrow}</span>
    </button>
  );
}

export default function JobsTable({ jobs, visible, sort, dir, onSort, selection, actions }) {
  const ariaSort = (key) => (sort === key ? (dir === "asc" ? "ascending" : "descending") : "none");
  const sortProps = { activeSort: sort, dir, onSort };

  return (
    <div className="tbl:relative tbl:overflow-x-auto tbl:rounded-lg tbl:border tbl:border-rule tbl:bg-surface">
      <table aria-label="Jobs" className="block w-full border-collapse text-sm tbl:table tbl:min-w-[900px]">
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
            <th scope="col" className={thBase} aria-sort={ariaSort("title")}>
              <SortButton sortKey="title" {...sortProps}>Job</SortButton>
              <span className="ml-2">
                <SortButton sortKey="company" {...sortProps}>Company</SortButton>
              </span>
            </th>
            <th scope="col" className={thBase} aria-sort={ariaSort("stage")}>
              <SortButton sortKey="stage" {...sortProps}>Stage</SortButton>
            </th>
            {visible.priority && (
              <th scope="col" className={thBase} aria-sort={ariaSort("priority")}>
                <SortButton sortKey="priority" {...sortProps}>Priority</SortButton>
              </th>
            )}
            {visible.mode && <th scope="col" className={thBase}>Mode</th>}
            {visible.source && <th scope="col" className={thBase}>Source</th>}
            {visible.applied && (
              <th scope="col" className={thBase} aria-sort={ariaSort("applied")}>
                <SortButton sortKey="applied" {...sortProps}>Applied</SortButton>
              </th>
            )}
            {visible.deadline && <th scope="col" className={thBase}>Deadline</th>}
            {visible.days && (
              <th scope="col" className={thBase} aria-sort={ariaSort("days")}>
                <SortButton sortKey="days" {...sortProps}>Days in stage</SortButton>
              </th>
            )}
            {visible.reminder && <th scope="col" className={thBase}>Reminder</th>}
            <th className={`${thBase} w-14`}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody className="block tbl:table-row-group">
          {jobs.map((job, index) => (
            <JobRow
              key={job.id}
              job={job}
              visible={visible}
              selected={selection.selected.has(job.id)}
              onToggle={() => selection.toggle(job.id)}
              menuOpensUp={index >= jobs.length - 3}
              actions={actions}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}