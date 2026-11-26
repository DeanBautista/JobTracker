import { Link, useLocation } from "react-router-dom";
import StageTag, { DaysLeftTag } from "./StageTag";
import { formatDate } from "../utils/format";

// Below the `tbl` breakpoint each row is a stacked card; above it, a normal table row.
const cell = "col-start-2 block tbl:table-cell tbl:border-t tbl:border-rule tbl:px-2.5 tbl:py-3 tbl:align-middle";
const meta = "font-mono text-[13px] text-muted";

export default function TrashRow({ job, index = 0, intro = false, view, selected, onToggle, actions, onPurge }) {
  const location = useLocation();
  const from = `${location.pathname}${location.search}`; // e.g. /trash?view=trash&page=2
  const isTrash = view === "trash";
  const label = `${job.title} at ${job.company}`;

  return (
    <tr
      style={intro ? { animationDelay: `${Math.min(index, 5) * 40}ms` } : undefined}
      className={`${intro ? "animate-rise " : ""}...existing classes...`}
    >
      <td
        className={`block ${isTrash ? "row-span-5" : "row-span-4"} pt-0.5 tbl:table-cell tbl:w-11 tbl:border-t tbl:border-rule tbl:py-3 tbl:pr-0 tbl:pl-2.5 tbl:align-middle`}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Select ${label}`}
          className="m-0 size-5 cursor-pointer accent-accent tbl:size-[17px]"
        />
      </td>

      <td className={cell}>
        <strong className="block leading-[1.3] font-semibold">
          <Link to={`/jobs/${job.id}`} state={{ from }} className="underline-offset-3 hover:underline">
            {job.title}
          </Link>
        </strong>
        <span className="block text-[13px] text-muted">{job.company}</span>
      </td>

      <td className={cell}>
        <StageTag stage={job.stage} />
      </td>

      <td className={`${cell} ${meta}`}>
        <span className="tbl:hidden">{isTrash ? "Deleted" : "Archived"}: </span>
        {formatDate(isTrash ? job.deletedAt : job.archivedAt)}
      </td>

      {isTrash && (
        <td className={cell}>
          <span className={`${meta} tbl:hidden`}>Days left: </span>
          <DaysLeftTag days={job.daysLeft} />
        </td>
      )}

      <td className={`${cell} mt-1.5 tbl:mt-0`}>
        <div className="flex flex-wrap gap-2 tbl:justify-end">
          {isTrash ? (
            <>
              <button type="button" onClick={() => actions.restore([job.id])} aria-label={`Restore ${label}`} className="btn btn-sm">
                Restore
              </button>
              <button type="button" onClick={() => onPurge([job.id])} aria-label={`Delete ${label} forever`} className="btn btn-sm btn-danger">
                Delete forever
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => actions.unarchive([job.id])} aria-label={`Unarchive ${label}`} className="btn btn-sm">
                Unarchive
              </button>
              <button type="button" onClick={() => actions.trash([job.id])} aria-label={`Delete ${label}`} className="btn btn-sm btn-danger">
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
