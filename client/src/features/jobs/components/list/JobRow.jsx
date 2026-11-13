import { Link } from "react-router-dom";
import { formatShortDate } from "../../utils/formatDate";
import { optionLabel } from "../../utils/jobOptions";
import { PriorityBadge, ReminderTag, StageBadge } from "../shared/JobBadges";
import RowMenu from "./RowMenu";

function Cell({ className = "", wideOnly = false, children }) {
  return (
    <td
      className={`${
        wideOnly ? "hidden tbl:table-cell" : "block tbl:table-cell"
      } p-0 empty:hidden tbl:px-2.5 tbl:py-3 tbl:align-middle tbl:empty:table-cell ${className}`}
    >
      {children}
    </td>
  );
}

const Dash = () => <span className="text-muted">–</span>;

function buildMeta(job) {
  const parts = [job.company, optionLabel(job.mode).toLowerCase(), job.source];
  if (job.appliedAt) parts.push(`applied ${formatShortDate(job.appliedAt)}`);
  return parts.join(" · ");
}

export default function JobRow({ job, visible, selected, onToggle, menuOpensUp, actions }) {
  return (
    <tr
      className={`mb-2.5 grid grid-cols-[34px_minmax(0,1fr)_44px] gap-x-2 gap-y-1 rounded-lg border border-rule py-3.5 pr-2 pl-3.5 tbl:mb-0 tbl:table-row tbl:rounded-none tbl:border-x-0 tbl:border-t-0 tbl:p-0 tbl:last:border-b-0 ${
        selected ? "bg-accent-soft/70" : "bg-surface tbl:bg-transparent tbl:hover:bg-tint/55"
      }`}
    >
      <Cell className="row-span-3 pt-0.5 tbl:w-11 tbl:pt-3 tbl:pr-0">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Select ${job.title} at ${job.company}`}
          className="m-0 size-[17px] cursor-pointer accent-accent"
        />
      </Cell>

      <Cell className="col-start-2 tbl:min-w-[190px]">
        <Link to={`/jobs/${job.id}`} className="font-semibold no-underline underline-offset-3 hover:underline">
          {job.title}
        </Link>
        <span className="mt-px hidden text-[13px] text-muted tbl:block">{job.company}</span>
        <span className="mt-0.5 block text-[13px] text-muted tbl:hidden">{buildMeta(job)}</span>
      </Cell>

      <Cell className="col-start-2 mt-1.5 tbl:mt-0">
        <StageBadge stage={job.stage} />
      </Cell>

      {visible.priority && (
        <Cell className="col-start-2">
          <PriorityBadge priority={job.priority} />
        </Cell>
      )}
      {visible.mode && <Cell wideOnly>{optionLabel(job.mode)}</Cell>}
      {visible.source && <Cell wideOnly>{job.source}</Cell>}
      {visible.applied && (
        <Cell wideOnly className="font-mono text-[13px]">
          {job.appliedAt ? formatShortDate(job.appliedAt) : <Dash />}
        </Cell>
      )}
      {visible.deadline && (
        <Cell wideOnly className="font-mono text-[13px]">
          {job.deadline ? formatShortDate(job.deadline) : <Dash />}
        </Cell>
      )}
      {visible.days && (
        <Cell wideOnly className="font-mono text-[13px]">{job.daysInStage}</Cell>
      )}
      {visible.reminder && (
        <Cell className="col-start-2">
          {job.reminder && <ReminderTag {...job.reminder} />}
        </Cell>
      )}

      <Cell className="col-start-3 row-start-1 justify-self-end text-right tbl:w-14 tbl:pl-0">
        <RowMenu job={job} opensUp={menuOpensUp} actions={actions} />
      </Cell>
    </tr>
  );
}