import { CLOSED_STAGES, PRIORITIES, STAGES, STAGE_LABELS } from "../utils/detailOptions";
import { daysSince, formatDate, formatDays } from "../utils/formatters";
import PriorityTag from "./PriorityTag";
import StageTag from "./StageTag";

const TITLE_CLASS =
  "block w-full max-w-[720px] border-0 border-b border-dashed border-transparent bg-transparent pt-[3px] pb-[5px] font-serif text-[clamp(1.75rem,3vw,2.45rem)] leading-[1.1] tracking-[-0.025em] text-ink";

const Dot = () => (
  <span aria-hidden="true" className="text-rule">
    ·
  </span>
);

export default function JobDetailHeader({
  job,
  form,
  readOnly,
  onTitleBlur,
  onStageChange,
  onPriorityChange,
  onArchive,
  onDelete,
  onAddReminder,
}) {
  const { values, errors } = form;
  const closed = CLOSED_STAGES.includes(values.stage);

  return (
    <header className="border-b border-rule pb-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          {readOnly ? (
            <h1 className={`${TITLE_CLASS} break-words`}>{values.title}</h1>
          ) : (
            <>
              <label className="sr-only" htmlFor="job-title">
                Job title
              </label>
              <input
                id="job-title"
                className={`${TITLE_CLASS} hover:border-rule focus-visible:border-accent focus-visible:outline-offset-4`}
                value={values.title}
                maxLength={120}
                required
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={errors.title ? "job-title-error" : undefined}
                onChange={(e) => form.setValue("title", e.target.value)}
                onBlur={onTitleBlur}
              />
              {errors.title && (
                <small id="job-title-error" className="text-xs text-danger">
                  {errors.title}
                </small>
              )}
            </>
          )}
          <p className="mt-2 text-sm break-words text-muted">
            at{" "}
            {job.companyUrl ? (
              <>
                <a className="link text-ink" href={job.companyUrl} target="_blank" rel="noopener noreferrer">
                  {job.company}
                </a>{" "}
                <span aria-hidden="true">↗</span>
              </>
            ) : (
              <span className="text-ink">{job.company}</span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap xl:justify-end">
          {job.link && (
            <a className="btn px-2 sm:px-4" href={job.link} target="_blank" rel="noopener noreferrer">
              Open posting <span aria-hidden="true">↗</span>
            </a>
          )}
          <button type="button" className="btn px-2 sm:px-4" onClick={onAddReminder}>
            ＋ Add reminder
          </button>
          {!readOnly && (
            <>
              <button type="button" className="btn px-2 sm:px-4" onClick={onArchive}>
                Archive
              </button>
              <button type="button" className="btn btn-danger px-2 sm:px-4" onClick={onDelete}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-meta text-muted">
        {closed ? (
          <span>
            Closed on <strong className="font-semibold text-ink">{formatDate(job.closure?.closedDate || job.stageChangedAt)}</strong>
          </span>
        ) : (
          <span>
            In <strong className="font-semibold text-ink">{STAGE_LABELS[values.stage]}</strong> for{" "}
            <strong className="font-semibold text-ink">{formatDays(daysSince(job.stageChangedAt))}</strong>
          </span>
        )}
        <Dot />
        <span>
          Added <time dateTime={job.createdAt}>{formatDate(job.createdAt)}</time>
        </span>
        <Dot />
        <StageTag stage={values.stage} />
        <PriorityTag priority={values.priority} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-end">
        <div className="grid gap-1.5 sm:w-[168px]">
          <label className="label" htmlFor="stage">
            Stage
          </label>
          <select
            id="stage"
            className="field w-full"
            value={values.stage}
            disabled={readOnly}
            onChange={(e) => onStageChange(e.target.value)}
          >
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5 sm:w-[168px]">
          <label className="label" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            className="field w-full"
            value={values.priority}
            disabled={readOnly}
            onChange={(e) => onPriorityChange(e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
