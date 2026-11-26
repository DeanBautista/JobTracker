import { useDraggable, useDroppable } from "@dnd-kit/core";
import { cx } from "../../utils/cx";
import { justDragged } from "./dragGuard";
import JobCard from "./JobCard";

// The accent line that shows where the dragged card will land. It is absolutely positioned
// in the 10px gap between cards, so showing it never shifts the layout. It runs 8px past the
// card edges and has round caps, because the dragged card usually covers the middle of it.
export const DropLine = ({ edge }) => (
  <span
    aria-hidden="true"
    className={cx(
      "pointer-events-none absolute -inset-x-2 z-10 h-[3px] rounded-full bg-accent",
      edge === "top" ? "-top-[6.5px]" : "-bottom-[6.5px]",
    )}
  >
    <i className="absolute top-1/2 -left-0.5 size-2.5 -translate-y-1/2 rounded-full bg-accent" />
    <i className="absolute top-1/2 -right-0.5 size-2.5 -translate-y-1/2 rounded-full bg-accent" />
  </span>
);

export default function DraggableJobCard({ job, index, onMove, onArchive, onDelete, lineBefore = false, lineAfter = false }) {
  // Every card is both draggable and a drop target (dropping on a card = placing next to it).
  // Deliberately NOT spreading `attributes`: they would make the wrapper a second tab stop
  // next to the card link and the Move menu. Keyboard users move cards with the menu.
  const drag = useDraggable({ id: job.id, data: { job } });
  const drop = useDroppable({
      id: `card:${job.id}`,
      data: { kind: "card", stage: job.stage, jobId: job.id },
      disabled: drag.isDragging,
    });

  const setRefs = (node) => {
    drag.setNodeRef(node);
    drop.setNodeRef(node);
  };

  return (
    <div
      ref={setRefs}
      {...drag.listeners}
      onClickCapture={(e) => {
        if (justDragged()) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      className={cx("relative select-none [-webkit-touch-callout:none]", drag.isDragging && "opacity-40")}
    >
      {lineBefore && <DropLine edge="top" />}
      <JobCard job={job} index={index} onMove={onMove} onArchive={onArchive} onDelete={onDelete} />
      {lineAfter && <DropLine edge="bottom" />}
    </div>
  );
}
