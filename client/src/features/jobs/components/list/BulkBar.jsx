import { useState } from "react";
import { OPEN_STAGES } from "../../utils/jobOptions";

export default function BulkBar({ count, onMove, onArchive, onDelete, onExport, onClear }) {
  const [stage, setStage] = useState("");

  const handleMove = () => {
    onMove(stage);
    setStage("");
  };

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="sticky bottom-[72px] z-12 mt-4 flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-[10px] border border-ink bg-surface px-3.5 py-2.5 shadow-float sm:bottom-4"
    >
      <span aria-live="polite" className="text-sm font-semibold">{count} selected</span>

      <select
        value={stage}
        onChange={(e) => setStage(e.target.value)}
        aria-label="Change stage to"
        className="field min-h-[34px] text-[13px]"
      >
        <option value="">Change stage to…</option>
        {OPEN_STAGES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <button type="button" disabled={!stage} onClick={handleMove} className="btn btn-sm">Move</button>
      <button type="button" onClick={onArchive} className="btn btn-sm">Archive</button>
      <button type="button" onClick={onDelete} className="btn btn-sm btn-danger">Delete</button>
      <button type="button" onClick={onExport} className="btn btn-sm">Export selection</button>
      <button type="button" onClick={onClear} className="link ml-auto cursor-pointer text-[13px]">Clear</button>
    </div>
  );
}