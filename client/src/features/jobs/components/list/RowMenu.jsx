import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import useDismiss from "../../../../lib/useDismiss";
import { OPEN_STAGES } from "../../utils/jobOptions";

const item =
  "block w-full cursor-pointer rounded-sm border-0 bg-transparent px-2.5 py-[9px] text-left text-sm no-underline hover:bg-tint";

export default function RowMenu({ job, opensUp, actions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(ref, open, () => setOpen(false));

  const run = (fn) => () => {
    fn([job.id]);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label={`Actions for ${job.title} at ${job.company}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-grid size-[34px] cursor-pointer place-items-center rounded-md border font-semibold tracking-[1px] hover:border-rule hover:bg-paper hover:text-ink ${
          open ? "border-rule bg-paper text-ink" : "border-transparent text-muted"
        }`}
      >
        ···
      </button>

      {open && (
        <div
          className={`absolute right-0 z-25 w-[210px] rounded-lg border border-ink bg-surface p-1.5 text-left ${
            opensUp ? "bottom-[38px]" : "top-[38px]"
          }`}
        >
          <Link to={`/jobs/${job.id}`} className={item}>Open</Link>

          <div className="mt-1 border-t border-rule px-2.5 pt-2 pb-1">
            <span className="label mb-1.5 block">Move to</span>
            <div className="flex flex-wrap gap-1">
              {OPEN_STAGES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    actions.moveStage([job.id], value);
                    setOpen(false);
                  }}
                  className="cursor-pointer rounded-full border border-rule bg-paper px-2 py-1 text-xs hover:border-ink"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-1 border-t border-rule pt-1">
            <button type="button" onClick={run(actions.archive)} className={item}>Archive</button>
            <button type="button" onClick={run(actions.remove)} className={`${item} text-danger`}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}