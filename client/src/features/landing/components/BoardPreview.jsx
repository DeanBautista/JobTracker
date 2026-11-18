import cx from "@/lib/cx";
import { BOARD_COLUMNS } from "@/features/landing/data/landingContent";

const DOT_COLOR = {
  low: "bg-rule",
  normal: "bg-accent",
  high: "bg-danger",
};

function JobCard({ title, company, meta, priority, lifted }) {
  return (
    <div
      className={cx(
        "mb-2 rounded-md border bg-surface px-2.5 py-[9px] text-[12.5px] leading-[1.35]",
        lifted
          ? "-translate-x-[3px] -translate-y-[5px] rotate-[1.5deg] border-ink shadow-[3px_3px_0_var(--color-ink)]"
          : "border-rule",
      )}
    >
      <span className="block text-[13px] font-semibold">{title}</span>
      <span className="block text-[11.5px] text-muted">{company}</span>
      <div className="mt-[7px] flex items-center gap-1.5 font-mono text-[10.5px] leading-none text-muted">
        <span className={`size-[7px] flex-none rounded-full ${DOT_COLOR[priority]}`} />
        {meta}
      </div>
    </div>
  );
}

export default function BoardPreview() {
  return (
    <figure aria-label="Illustration of the job board">
      <div aria-hidden="true" className="overflow-hidden rounded-[10px] border border-ink bg-surface">
        <div className="flex items-center justify-between border-b border-rule px-3.5 py-2.5 font-mono text-xs leading-none font-medium text-muted">
          <span className="inline-flex gap-[5px]">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-2 rounded-full border border-rule" />
            ))}
          </span>
          <span>Board</span>
          <span>4 of 9 stages</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 bg-tint p-3.5 sm:grid-cols-4">
          {BOARD_COLUMNS.map(({ stage, jobs }) => (
            <div key={stage} className="max-sm:nth-[n+3]:hidden">
              <h3 className="mb-2 flex justify-between font-mono text-[11px] leading-none font-medium tracking-[0.06em] text-muted uppercase">
                {stage} <span className="text-ink">{jobs.length}</span>
              </h3>
              {jobs.map((job) => (
                <JobCard key={job.title} {...job} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <figcaption className="label mt-3">Sample data, not real companies</figcaption>
    </figure>
  );
}