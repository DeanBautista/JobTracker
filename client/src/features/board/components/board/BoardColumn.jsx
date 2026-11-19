import { useDroppable } from "@dnd-kit/core";
import { cx } from "../../utils/cx";
import CardList from "./CardList";
import CountBadge from "./CountBadge";

/**
 * activeStage: stage of the card being dragged, or null when nothing is being dragged.
 * dropTarget:  { stage, beforeId } while dragging over something valid, else null.
 */
export default function BoardColumn({ stage, label, jobs, activeStage, dropTarget, onMove, onAddJob, onArchive, onDelete }) {
  const { setNodeRef } = useDroppable({ id: `stage:${stage}`, data: { kind: "column", stage } });
  // Whole-column highlight is for moving INTO a column; reordering inside one only shows the line.
  const highlight = dropTarget?.stage === stage && activeStage !== stage;

  return (
    <section
      ref={setNodeRef}
      id={`column-${stage}`}
      aria-labelledby={`heading-${stage}`}
      className={cx(
        "flex min-w-0 flex-[0_0_226px] snap-start flex-col gap-2.5 rounded-lg max-[700px]:flex-[0_0_236px]",
        highlight && "bg-accent-soft/40 outline-2 outline-offset-[6px] outline-accent/60 outline-dashed",
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b border-rule px-0.5 pb-2.5">
        <h2 id={`heading-${stage}`} className="font-serif text-[1.1rem] leading-[1.15] font-medium">
          {label}
        </h2>
        <CountBadge label={`${jobs.length} ${jobs.length === 1 ? "job" : "jobs"}`}>{jobs.length}</CountBadge>
      </header>

      <CardList
        stage={stage}
        jobs={jobs}
        dropTarget={dropTarget}
        onMove={onMove}
        onArchive={onArchive}
        onDelete={onDelete}
        className="min-h-[100px]"
      />

      <button
        type="button"
        onClick={() => onAddJob(stage)}
        aria-label={`Add job to ${label}`}
        className="flex min-h-10 cursor-pointer items-center gap-[7px] rounded-md border border-dashed border-transparent px-2 text-[13px] text-muted hover:border-rule hover:bg-surface hover:text-ink"
      >
        <span aria-hidden="true" className="text-lg leading-none">+</span> Add job
      </button>
    </section>
  );
}
