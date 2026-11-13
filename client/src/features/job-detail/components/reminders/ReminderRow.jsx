import cx from "../../../../lib/cx";
import ActionMenu from "../../../../components/ui/ActionMenu";
import TextBadge from "../../../../components/ui/TextBadge";
import { REMINDER_ORIGIN_LABELS } from "../../utils/detailOptions";
import { formatDate, getDueInfo } from "../../utils/formatters";

export default function ReminderRow({ reminder, readOnly, onComplete, onEdit, onSnooze, onDismiss, onDelete }) {
  const done = Boolean(reminder.doneAt);
  const due = getDueInfo(reminder);

  return (
    // auto-sized side columns: the 40px buttons used to spill out of 30-34px tracks
    <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2 border-b border-rule py-3.5 last:border-b-0 sm:gap-x-3">
      <div className="grid w-10 place-items-center">
        {done ? (
          <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-accent-soft font-semibold text-accent">
            ✓
          </span>
        ) : (
          <button
            type="button"
            aria-label={`Mark ${reminder.title} done`}
            onClick={onComplete}
            disabled={readOnly}
            className="grid size-10 cursor-pointer place-items-center rounded-full border border-rule bg-surface font-semibold text-accent hover:border-accent hover:bg-accent-soft disabled:pointer-events-none disabled:opacity-45"
          >
            ✓
          </button>
        )}
      </div>

      <div className="min-w-0">
        <strong className={cx("text-sm font-semibold break-words", done && "line-through decoration-rule")}>{reminder.title}</strong>
        <p className="mt-[3px] flex flex-wrap items-center gap-2 text-xs text-muted">
          {done ? <span>Done · {formatDate(reminder.doneAt)}</span> : <span>{due.label}</span>}
          {!done && due.badge && <TextBadge tone="danger">{due.badge}</TextBadge>}
        </p>
        <div className="mt-[7px] flex flex-wrap gap-x-3.5 gap-y-[7px] text-[11.5px] text-muted">
          <span>Origin: {REMINDER_ORIGIN_LABELS[reminder.origin] ?? reminder.origin}</span>
          <span>{done && reminder.doneBy ? `Completed by ${reminder.doneBy}` : `Created ${formatDate(reminder.createdAt)}`}</span>
        </div>
      </div>

      {readOnly ? (
        <span />
      ) : (
        <ActionMenu label="Reminder actions">
          {done ? (
            <ActionMenu.Item onClick={onComplete}>Mark not done</ActionMenu.Item>
          ) : (
            <>
              <ActionMenu.Item onClick={onEdit}>Edit</ActionMenu.Item>
              <ActionMenu.Item onClick={onSnooze}>Snooze 1 day</ActionMenu.Item>
              <ActionMenu.Item onClick={onDismiss}>Dismiss</ActionMenu.Item>
            </>
          )}
          <ActionMenu.Item danger onClick={onDelete}>
            Delete
          </ActionMenu.Item>
        </ActionMenu>
      )}
    </article>
  );
}
