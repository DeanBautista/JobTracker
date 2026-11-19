import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cx } from "../../utils/cx";
import { CLOSED_STAGES } from "../../utils/boardStages";
import CountBadge from "./CountBadge";
import CardList from "./CardList";

// Collapsed: each status row in the summary is its own drop target.
function MiniDropRow({ stage, label, count, activeStage, dropTarget }) {
  const { setNodeRef } = useDroppable({ id: `stage:${stage}`, data: { kind: "row", stage } });
  const dragging = activeStage !== null;
  const isOver = dropTarget?.stage === stage;
  return (
    <span
      ref={setNodeRef}
      className={cx(
        "-mx-1.5 flex items-center justify-between gap-1 rounded-sm px-1.5 py-1.5",
        dragging && "outline-1 outline-rule outline-dashed",
        isOver && activeStage !== stage && "bg-accent-soft text-accent outline-accent",
      )}
    >
      {label} <b className="font-mono text-[13px] leading-none font-medium">{count}</b>
    </span>
  );
}

// Expanded: each group is a drop target.
function ClosedGroup({ stage, label, jobs, activeStage, dropTarget, onMove, onArchive, onDelete }) {
  const { setNodeRef } = useDroppable({ id: `stage:${stage}`, data: { kind: "group", stage } });
  const dragging = activeStage !== null;
  const isOver = dropTarget?.stage === stage;
  return (
    <section
      ref={setNodeRef}
      aria-labelledby={`closed-${stage}`}
      className={cx(
        "grid min-h-14 content-start gap-2 rounded-lg",
        isOver && activeStage !== stage && "bg-accent-soft/40 outline-2 outline-offset-[6px] outline-accent/60 outline-dashed",
      )}
    >
      <h3
        id={`closed-${stage}`}
        className="flex items-center justify-between gap-2 border-b border-rule pb-[7px] font-serif text-base leading-[1.2] font-medium"
      >
        {label} <span className="font-mono text-[11px] leading-none text-muted">{jobs.length}</span>
      </h3>
      <CardList stage={stage} jobs={jobs} dropTarget={dropTarget} onMove={onMove} onArchive={onArchive} onDelete={onDelete} />
      {jobs.length === 0 && (
        <p className="text-[12.5px] text-muted">{dragging ? "Drop a job here" : "Nothing here yet"}</p>
      )}
    </section>
  );
}

export default function ClosedColumn({ groups, activeStage, dropTarget, onMove, onArchive, onDelete }) {
  const [open, setOpen] = useState(false);
  const dragging = activeStage !== null;
  const total = CLOSED_STAGES.reduce((n, s) => n + groups[s.value].length, 0);

  return (
    <section
      id="column-closed"
      aria-labelledby="heading-closed"
      className={cx("flex min-w-0 snap-start flex-col gap-2.5", open ? "flex-[0_0_226px]" : "flex-[0_0_156px]")}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="closed-content"
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "flex cursor-pointer flex-col gap-3 rounded-lg border px-2.5 py-3.5 text-left",
          open ? "border-ink bg-tint" : "min-h-[210px] border-rule bg-surface max-sm:min-h-[200px]",
        )}
      >
        <span className="flex items-center justify-between gap-1.5">
          <strong id="heading-closed" className="font-serif text-[1.1rem] leading-[1.1] font-medium">Closed</strong>
          <CountBadge label={`${total} closed`}>{total}</CountBadge>
        </span>

        {!open && (
          <span className="grid gap-0.5 text-[13px] text-ink">
            {CLOSED_STAGES.map((s) => (
              <MiniDropRow key={s.value} stage={s.value} label={s.label} count={groups[s.value].length} activeStage={activeStage} dropTarget={dropTarget} />
            ))}
          </span>
        )}

        <span className="mt-auto font-mono text-xs leading-[1.3] font-medium text-ink">
          {open ? "Collapse ←" : dragging ? "Drop on a status" : "Expand to view →"}
        </span>
      </button>

      {open && (
        <div id="closed-content" className="grid gap-3.5">
          {CLOSED_STAGES.map((s) => (
            <ClosedGroup
              key={s.value}
              stage={s.value}
              label={s.label}
              jobs={groups[s.value]}
              activeStage={activeStage}
              dropTarget={dropTarget}
              onMove={onMove}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}
