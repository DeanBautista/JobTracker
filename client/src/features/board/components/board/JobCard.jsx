import { Link } from "react-router-dom";
import { cx } from "../../utils/cx";
import { getCardChips, stageAgeLabel } from "../../utils/boardCard";
import { MODE_LABELS, PRIORITY_LABELS, STAGE_LABELS, isClosedStage } from "../../utils/boardStages";
import MoveMenu from "./MoveMenu";

const badge =
  "inline-flex min-h-[22px] items-center gap-[5px] rounded-sm border px-[7px] py-0.5 font-mono text-[10.5px] leading-[1.3] font-medium whitespace-nowrap";

// Full class names so Tailwind can see them.
const PRIORITY_STYLES = {
  low: "border-rule bg-tint text-ink",
  medium: "border-amber bg-amber-soft text-amber",
  high: "border-danger bg-danger-soft text-danger",
};

const CHIP_STYLES = {
  neutral: "bg-tint text-muted",
  positive: "bg-accent-soft text-accent",
  urgent: "border border-danger/30 bg-danger-soft text-danger",
};

const STAGGER_LIMIT = 6;
const STAGGER_MS = 40;

/**
 * Pure presentation. Drag behaviour lives in DraggableJobCard, so this same card is
 * used in the column, in the drag overlay, and anywhere else you need it.
 */
export default function JobCard({ job, onMove, onArchive, onDelete, overlay = false, index = Infinity }) {
  const closed = isClosedStage(job.stage);
  const title = `${job.title} at ${job.company}`;
  const chips = getCardChips(job);

  return (
    <article
      aria-label={title}
      data-mode={job.mode}
      data-priority={job.priority}
      style={index < STAGGER_LIMIT ? { animationDelay: `${index * STAGGER_MS}ms` } : undefined}
      className={cx(
        "relative isolate min-w-0 rounded-lg border bg-surface transition-[border-color,box-shadow] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-3 has-[a:focus-visible]:outline-accent motion-reduce:transition-none",
        !overlay && index < STAGGER_LIMIT && "group-data-[intro=true]/board:animate-rise",
        overlay
          ? "pointer-events-none rotate-1 cursor-grabbing border-accent shadow-[0_14px_28px_rgb(0_0_0/0.18)]"
          : "border-rule hover:border-muted hover:shadow-[0_4px_12px_rgb(0_0_0/0.05)]",
      )}
    >
      {/* Full-card link. draggable=false stops the browser's native link drag from
          hijacking the pointer before dnd-kit sees it. */}
      <Link
        to={`/jobs/${job.id}`}
        state={{ from: "board" }}
        draggable={false}
        aria-label={`Open ${title}`}
        className="absolute inset-0 z-[2] rounded-lg focus-visible:outline-none"
      />

      {!overlay && <MoveMenu job={job} onMove={onMove} onArchive={onArchive} onDelete={onDelete} />}

      <div
        className={cx(
          "pointer-events-none relative z-0 flex flex-col items-start px-3 pt-[13px] pb-3",
          closed ? "min-h-[166px]" : "min-h-[190px]",
        )}
      >
        <div className="mb-[11px] flex min-h-[21px] flex-wrap items-center gap-[5px] pr-12">
          {MODE_LABELS[job.mode] && (
            <span className={cx(badge, "border-rule bg-paper text-muted")}>{MODE_LABELS[job.mode]}</span>
          )}
          <span className={cx(badge, PRIORITY_STYLES[job.priority])}>{PRIORITY_LABELS[job.priority]} priority</span>
        </div>

        <h3 className="mr-7 mb-0.5 font-serif text-[1.05rem] leading-[1.25] font-medium tracking-[-0.01em]">
          {job.title}
        </h3>
        <p className="mb-[5px] text-[13px] text-muted">{job.company}</p>
        {job.location && <p className="text-xs leading-[1.35] text-muted">{job.location}</p>}

        {closed && (
          <span className={cx(badge, "mt-2 border-rule bg-tint")}>{STAGE_LABELS[job.stage]}</span>
        )}

        <div className="mt-auto flex w-full flex-col items-start gap-1.5 pt-3.5">
          <span className="font-mono text-[10.5px] leading-[1.4] font-medium text-muted">{stageAgeLabel(job)}</span>
          {chips.map((chip) => (
            <span
              key={chip.key}
              className={cx(
                "inline-flex max-w-full flex-wrap items-center gap-[5px] rounded-sm px-[7px] py-1 font-mono text-[10.5px] leading-[1.35] font-medium",
                CHIP_STYLES[chip.tone],
              )}
            >
              {chip.prefix && <span className="font-medium text-accent">{chip.prefix}</span>}
              {chip.label}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
