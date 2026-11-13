import cx from "../../../../lib/cx";
import Panel from "../../../../components/ui/Panel";
import TextBadge from "../../../../components/ui/TextBadge";
import { INTERVIEW_MODE_LABELS } from "../../utils/detailOptions";
import { formatTime } from "../../utils/formatters";

const STATUS = {
  scheduled: { label: "Scheduled", tone: "accent" },
  passed: { label: "Passed", tone: "accent" },
  pending: { label: "Pending", tone: "default" },
  failed: { label: "Not selected", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "default" },
};

const part = (date, options) => new Intl.DateTimeFormat("en-US", options).format(date).toUpperCase();

function Stars({ rating }) {
  return (
    <p className="mt-[5px] tracking-[0.08em] text-accent" aria-label={`Rating ${rating} out of 5`}>
      {"★".repeat(rating)}
      <span className="text-rule">{"★".repeat(5 - rating)}</span>{" "}
      <small className="font-mono text-[11px] tracking-normal text-muted">{rating}/5</small>
    </p>
  );
}

export default function RoundCard({ round, past, readOnly, onEdit, onResult, onCancel }) {
  const start = new Date(round.startsAt);
  const status = STATUS[round.status] ?? STATUS.pending;
  const hasLink = /^https?:\/\//.test(round.location);

  return (
    <Panel
      as="article"
      className="grid grid-cols-[52px_minmax(0,1fr)] gap-[11px] p-[13px] sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-4 sm:p-[17px]"
    >
      <div
        className={cx(
          "grid content-start justify-items-center gap-[3px] self-start rounded-[7px] border border-rule bg-paper px-[5px] py-[9px]",
          past && "opacity-75",
        )}
      >
        <span className="font-mono text-[10px] leading-[1.2] font-medium tracking-[0.06em] text-muted">
          {part(start, { month: "short" })}
        </span>
        <strong className="font-serif text-[1.65rem] leading-none font-medium">{start.getDate()}</strong>
        <small className="font-mono text-[10px] leading-[1.2] font-medium tracking-[0.06em] text-muted">
          {part(start, { weekday: "short" })}
        </small>
      </div>

      <div className="min-w-0">
        <div className="grid justify-items-start gap-2 sm:flex sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-[1.08rem] leading-tight font-medium break-words">{round.type}</h3>
            {(round.interviewer || round.role) && (
              <p className="mt-[3px] text-xs text-muted">{[round.interviewer, round.role].filter(Boolean).join(" · ")}</p>
            )}
          </div>
          <TextBadge tone={status.tone}>{status.label}</TextBadge>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-3.5 gap-y-[7px] text-xs text-muted">
          <span>
            <strong className="font-semibold text-ink">{formatTime(round.startsAt)}</strong> · {round.durationMin} min
          </span>
          <span>{INTERVIEW_MODE_LABELS[round.mode]}</span>
          {hasLink ? (
            <a className="link" href={round.location} target="_blank" rel="noopener noreferrer">
              Join meeting ↗
            </a>
          ) : (
            round.location && <span className="break-words">{round.location}</span>
          )}
        </div>

        {round.result?.feedback ? (
          <div className="mt-3.5 border-t border-rule pt-3">
            <span className="label">Feedback</span>
            <p className="mt-[5px] text-meta break-words text-muted">{round.result.feedback}</p>
            {round.result.rating > 0 && <Stars rating={round.result.rating} />}
          </div>
        ) : (
          round.prepNotes && (
            <div className="mt-3.5 border-t border-rule pt-3">
              <span className="label">Prep notes</span>
              <p className="mt-[5px] text-meta break-words text-muted">{round.prepNotes}</p>
            </div>
          )
        )}

        {!readOnly && (
          <div className="mt-[13px] flex flex-wrap items-center gap-[7px]">
            <button type="button" className="btn btn-sm" onClick={onEdit}>
              Edit
            </button>
            {!past && (
              <button type="button" className="btn btn-sm" onClick={onEdit}>
                Reschedule
              </button>
            )}
            {!past && (
              <button type="button" className="btn btn-sm btn-danger" onClick={onCancel}>
                Cancel round
              </button>
            )}
            {past && (
              <button type="button" className={cx("btn btn-sm", !round.result && "btn-primary")} onClick={onResult}>
                {round.result ? "Edit result" : "How did it go?"}
              </button>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}
