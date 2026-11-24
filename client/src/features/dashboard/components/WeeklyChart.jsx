import Card from "./shared/Card";

export default function WeeklyChart({ counts, goal, status, onRetry, className }) {

  if (status !== "success") {
    return (
      <Card title="Applications per week" subtitle="Last 8 weeks." className={className}>
        {status === "loading" ? (
          <p className="text-sm text-muted">Loading chart…</p>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-danger">Couldn't load the chart.</span>
            <button type="button" className="btn btn-sm" onClick={onRetry}>
              Retry
            </button>
          </div>
        )}
      </Card>
    );
  }

  const weeks = counts.length;
  const max = Math.ceil(Math.max(10, goal, ...counts) / 10) * 10;
  const metCount = counts.filter((count) => count >= goal).length;
  const ticks = [0, max / 2, max];

  return (
    <Card
      title="Applications per week"
      subtitle={`Last ${weeks} weeks. Your goal is ${goal} a week.`}
      className={className}
    >
      <div
        role="img"
        aria-label={`Applications per week over the last ${weeks} weeks: ${counts.join(", ")}. Goal is ${goal} a week, met in ${metCount} of ${weeks} weeks.`}
        className="grid h-44 grid-cols-[24px_minmax(0,1fr)]"
      >
        <div className="relative font-mono text-[11px] leading-none text-muted" aria-hidden="true">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-2 translate-y-1/2"
              style={{ bottom: `${(tick / max) * 100}%` }}
            >
              {tick}
            </span>
          ))}
        </div>

        <div
          className="relative flex items-end gap-2.5 border-b border-muted px-1"
          aria-hidden="true"
        >
          <span className="absolute inset-x-0 top-0 border-t border-rule" />
          <span className="absolute inset-x-0 top-1/2 border-t border-rule" />

        {counts.map((count, i) => {
          const weeksAgo = weeks - 1 - i;
          const weekLabel =
            weeksAgo === 0 ? "This week" : weeksAgo === 1 ? "Last week" : `${weeksAgo} weeks ago`;
          const height = (count / max) * 100;

          return (
            <div key={i} className="group relative flex h-full flex-1 items-end">
              <span
                className={`block w-full rounded-t-[3px] border border-b-0 border-accent group-hover:border-ink group-hover:bg-ink ${
                  count >= goal ? "bg-accent" : "bg-accent-soft"
                }`}
                style={{ height: `${height}%` }}
              />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-1/2 z-20 hidden -translate-x-1/2 rounded-md bg-ink px-2.5 py-1.5 text-center font-sans text-[12px] leading-[1.35] whitespace-nowrap text-on-ink group-hover:block"
                style={{ bottom: `calc(${height}% + 6px)` }}
              >
                <b className="block font-medium">
                  {count} {count === 1 ? "application" : "applications"}
                </b>
                <span className="opacity-70">{weekLabel}</span>
              </span>
            </div>
          );
        })}

          <div
            className="pointer-events-none absolute inset-x-0 border-t-[1.5px] border-dashed border-ink"
            style={{ bottom: `${(goal / max) * 100}%` }}
          >
            <span className="absolute -top-4.75 right-0 bg-surface px-1 font-mono text-[11px] leading-[1.3] font-medium">
              goal {goal}
            </span>
          </div>
        </div>
      </div>

      <div
        className="mt-2 ml-6 flex justify-between font-mono text-[11px] leading-none text-muted"
        aria-hidden="true"
      >
        <span>{weeks} weeks ago</span>
        <span>This week</span>
      </div>

      <div className="mt-3.5 flex gap-4 text-[12.5px] text-muted" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5">
          <i className="size-2.5 rounded-xs border border-accent bg-accent" />
          Goal met
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="size-2.5 rounded-xs border border-accent bg-accent-soft" />
          Below goal
        </span>
      </div>
    </Card>
  );
}
