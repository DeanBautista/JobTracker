import { useMemo, useState } from "react";
import {
  DndContext, DragOverlay, MouseSensor, TouchSensor,
  pointerWithin, useDndContext, useSensor, useSensors,
} from "@dnd-kit/core";
import { OPEN_STAGES } from "../../utils/boardStages";
import BoardColumn from "./BoardColumn";
import ClosedColumn from "./ClosedColumn";
import JobCard from "./JobCard";
import { markDragEnd } from "./dragGuard";

/**
 * Where does the pointer say the card should go?
 * - Over a card: that card.
 * - Over a column / closed group / closed row (including the gaps between cards and the empty
 *   space under a short column): the card in that column whose middle is closest to the
 *   pointer, so the drop point never flickers in the gaps.
 */
const collisionDetection = (args) => {
  const { collisionRect } = args;
  // Center of the dragged card, not the cursor.
  const center = collisionRect
    ? { x: collisionRect.left + collisionRect.width / 2, y: collisionRect.top + collisionRect.height / 2 }
    : args.pointerCoordinates;

  const hits = pointerWithin({ ...args, pointerCoordinates: center });
  const isCard = (h) => h.data?.droppableContainer.data.current?.kind === "card";

  const card = hits.find(isCard);
  if (card) return [card];

  const zone = hits[0];
  const pointer = center;
  if (!zone || !pointer) return [];
  // ...rest of the function stays the same

  const { stage } = zone.data.droppableContainer.data.current;
  let best = null;
  let bestDistance = Infinity;
  for (const container of args.droppableContainers) {
    const d = container.data.current;
    const rect = args.droppableRects.get(container.id);
    if (d?.kind !== "card" || d.stage !== stage || !rect) continue;
    const distance = Math.abs(pointer.y - (rect.top + rect.height / 2));
    if (distance < bestDistance) {
      best = container;
      bestDistance = distance;
    }
  }
  return best ? [{ id: best.id, data: { droppableContainer: best, value: bestDistance } }] : [zone];
};

/**
 * Turns "dragging `active` over `over`" into a drop target:
 *   { stage, beforeId }   beforeId = id of the card to land above, null = bottom,
 *                         undefined = column has nothing to measure against (top).
 *   null                  nothing would change (over itself, or back to the same spot).
 */
function resolveTarget(active, over, groups) {
  const d = over?.data.current;
  if (!d || !active) return null;

  const activeJob = active.data.current.job;
  let beforeId; // default: no cards to compare against

  if (d.kind === "card") {
    if (d.jobId === active.id) return null;
    const list = groups[d.stage].filter((j) => j.id !== active.id);
    const rect = active.rect.current.translated;
    const above = rect ? rect.top + rect.height / 2 < over.rect.top + over.rect.height / 2 : true;
    const at = list.findIndex((j) => j.id === d.jobId);
    beforeId = list[above ? at : at + 1]?.id ?? null;
  }

  if (d.stage === activeJob.stage) {
    // Landing right where it already is?
    const column = groups[d.stage];
    const nextSibling = column[column.findIndex((j) => j.id === active.id) + 1]?.id ?? null;
    if (beforeId === undefined || beforeId === nextSibling) return null;
  }
  return { stage: d.stage, beforeId };
}

// Replace dnd-kit's default "Draggable item 103 was dropped over droppable area..." text.
// The drop itself is announced by the toast ("Moved X to Y"), so it is not repeated here.
const announcements = {
  onDragStart: ({ active }) => `Picked up ${active.data.current.job.title}.`,
  onDragCancel: ({ active }) => `Move cancelled. ${active.data.current.job.title} stays where it was.`,
  // dnd-kit calls these two unconditionally, so they must exist. Returning nothing = no announcement.
  onDragOver: () => undefined,
  onDragEnd: () => undefined,
};
const screenReaderInstructions = {
  draggable: "Use the Move to menu on each card to change its stage with the keyboard.",
};

// Lives inside <DndContext> so it can read the live drag state with useDndContext().
// (onDragMove's `over` lags one movement behind, which made the drop line show up one column
// early. The context is up to date on every render, so the target is derived here instead.)
function BoardSurface({ groups, jobs, onMove, onAddJob, onArchive, onDelete }) {
  const { active, over } = useDndContext();

  const activeJob = active ? jobs.find((j) => j.id === active.id) : null;
  const activeStage = activeJob ? activeJob.stage : null;
  const dropTarget = resolveTarget(active, over, groups);

  return (
    <>
      <div
        role="region"
        aria-label="Job stages board"
        tabIndex={0}
        data-dragging={activeJob ? "true" : "false"}
        className="w-full snap-x snap-proximity overflow-x-auto overflow-y-hidden overscroll-x-contain px-0.5 pt-0.5 pb-4 [scrollbar-color:var(--color-rule)_transparent] [scrollbar-width:thin] data-[dragging=true]:snap-none data-[dragging=true]:select-none"
      >
        <div className="flex min-h-[300px] w-max items-stretch gap-3 max-sm:gap-2.5">
          {OPEN_STAGES.map((s) => (
          <BoardColumn
            key={s.value}
            stage={s.value}
            label={s.label}
            jobs={groups[s.value]}
            activeStage={activeStage}
            dropTarget={dropTarget}
            onMove={onMove}
            onAddJob={onAddJob}
            onArchive={onArchive}
            onDelete={onDelete}
          />
          ))}
          <ClosedColumn
            groups={groups}
            activeStage={activeStage}
            dropTarget={dropTarget}
            onMove={onMove}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* Rendered in a portal, so the card follows the pointer without being clipped by the board. */}
      <DragOverlay dropAnimation={null}>
        {activeJob ? <JobCard job={activeJob} overlay /> : null}
      </DragOverlay>
    </>
  );
}

/**
 * groups: { [stage]: Job[] } already filtered and ordered by position.
 * onMove(jobId, stage, { beforeId }) is the single entry point for every kind of move.
 */
export default function Board({ groups, jobs, onMove, onAddJob, onArchive, onDelete }) {
  const sensors = useSensors(
    // Mouse: a short click still opens the card; the drag starts after 8px of movement.
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    // Touch: press-and-hold so swiping still scrolls the board sideways.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      accessibility={{ announcements, screenReaderInstructions }}
      onDragStart={() => window.getSelection()?.removeAllRanges()} // don't let the drag select page text
      onDragEnd={({ active, over }) => {
        const target = resolveTarget(active, over, groups);
        if (target) {
          onMove(active.id, target.stage, target.beforeId === undefined ? {} : { beforeId: target.beforeId });
        }
        markDragEnd();
      }}
      onDragCancel={markDragEnd}
    >
      <BoardSurface
        groups={groups}
        jobs={jobs}
        onMove={onMove}
        onAddJob={onAddJob}
        onArchive={onArchive}
        onDelete={onDelete}
      />
    </DndContext>
  );
}
