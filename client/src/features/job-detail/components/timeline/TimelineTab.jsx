import { useState } from "react";
import cx from "../../../../lib/cx";
import Panel from "../../../../components/ui/Panel";
import SectionHeader from "../../../../components/ui/SectionHeader";
import StateCard from "../../../../components/ui/StateCard";
import TextBadge from "../../../../components/ui/TextBadge";
import { formatDateTime } from "../../utils/formatters";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "stage", label: "Stage changes" },
  { key: "note", label: "Notes" },
  { key: "interview", label: "Interviews" },
  { key: "file", label: "Files" },
];
const ICONS = { stage: "⇢", note: "✎", interview: "◷", file: "↥", reminder: "✓" };
const BADGES = {
  stage: { label: "Stage change" },
  note: { label: "Note" },
  interview: { label: "Interview" },
  file: { label: "File" },
  reminder: { label: "Reminder", tone: "accent" },
};

export default function TimelineTab({ job }) {
  const [filter, setFilter] = useState("all");
  const events = job.timeline.filter((e) => filter === "all" || e.type === filter);

  return (
    <div className="grid gap-[18px]">
      <SectionHeader
        id="timeline-heading"
        title="Timeline"
        subtitle="A history of changes and activity on this job."
        aside={<span className="label">{job.timeline.length === 1 ? "1 event" : `${job.timeline.length} events`}</span>}
      />

      {job.timeline.length === 0 ? (
        <StateCard icon="↺" title="No timeline events yet" message="Changes, notes, interviews, and file activity will appear here." />
      ) : (
        <>
          <div role="group" aria-label="Filter timeline" className="flex flex-wrap gap-[7px]">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cx(
                  "inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full border px-3 text-meta hover:border-ink hover:bg-tint",
                  filter === f.key ? "border-ink bg-tint" : "border-rule bg-surface",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Panel aria-label="Recent job activity" className="px-3.5 sm:px-[18px]">
            {events.length === 0 ? (
              <p className="py-6 text-center text-meta text-muted">No events of this type.</p>
            ) : (
              <ol>
                {events.map((event) => {
                  const badge = BADGES[event.type];
                  return (
                    <li
                      key={event.id}
                      className="grid grid-cols-[34px_minmax(0,1fr)] items-start gap-x-[13px] gap-y-1.5 border-b border-rule py-[17px] last:border-b-0 sm:grid-cols-[34px_minmax(0,1fr)_auto]"
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-8 place-items-center rounded-full border border-rule bg-paper text-[15px]"
                      >
                        {event.icon ?? ICONS[event.type]}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm break-words">
                          <strong className="font-semibold">{event.title}</strong>
                          {event.detail && <> — {event.detail}</>}
                          {event.link && (
                            <>
                              {" "}
                              —{" "}
                              <a className="link" href={event.link.href} target="_blank" rel="noopener noreferrer">
                                {event.link.label}
                              </a>
                            </>
                          )}
                        </p>
                        <time dateTime={event.at} className="mt-[5px] block text-xs text-muted">
                          {formatDateTime(event.at)}
                        </time>
                      </div>
                      <div className="col-start-2 justify-self-start sm:col-start-3 sm:mt-[3px]">
                        <TextBadge tone={badge.tone}>{badge.label}</TextBadge>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>
          <p className="text-[12.5px] text-muted">Timeline is read-only. Events are recorded automatically.</p>
        </>
      )}
    </div>
  );
}
