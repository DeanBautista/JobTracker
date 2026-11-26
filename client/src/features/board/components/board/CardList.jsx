import { DropLine } from "./DraggableJobCard";
import DraggableJobCard from "./DraggableJobCard";

/**
 * A stack of draggable cards that draws the drop line for its stage.
 * Shared by the open columns and the expanded Closed groups.
 */
export default function CardList({ stage, jobs, dropTarget, onMove, onArchive, onDelete, className = "" }) {
  const here = dropTarget?.stage === stage ? dropTarget : null;
  return (
    <div className={`relative flex flex-col gap-2.5 ${className}`}>
      {here && jobs.length === 0 && <DropLine edge="top" />}
      {jobs.map((job, i) => (
        <DraggableJobCard
          key={job.id}
          job={job}
          index={i}
          onMove={onMove}
          onArchive={onArchive}
          onDelete={onDelete}
          lineBefore={here?.beforeId === job.id}
          lineAfter={here?.beforeId === null && i === jobs.length - 1}
        />
      ))}
    </div>
  );
}
