import { useRef, useState } from "react";
import useDismiss from "../../../../lib/useDismiss";
import { TOGGLE_COLUMNS } from "../../utils/jobOptions";

export default function ColumnsMenu({ visible, onToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(ref, open, () => setOpen(false));

  return (
    <div ref={ref} className="relative hidden tbl:block">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`btn btn-sm ${open ? "border-ink" : ""}`}
      >
        Columns
      </button>

      {open && (
        <div
          role="group"
          aria-label="Show columns"
          className="absolute top-10 right-0 z-25 min-w-[200px] rounded-lg border border-ink bg-surface px-3.5 py-2.5"
        >
          {TOGGLE_COLUMNS.map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm">
              <input
                type="checkbox"
                checked={visible[key]}
                onChange={() => onToggle(key)}
                className="m-0 size-4 accent-accent"
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}