import TextBadge from "@/components/ui/TextBadge";
import { DOCUMENT_ROWS, SCHEDULE_ROWS, STAGES, WEEKLY_BARS } from "@/features/landing/data/landingContent";

function PanelFrame({ label, children }) {
  return (
    <div role="img" aria-label={label} className="rounded-lg border border-rule bg-surface p-4">
      {children}
    </div>
  );
}

const STAGE_STYLE = {
  default: "border-rule",
  on: "border-ink bg-ink text-on-ink",
  end: "border-dashed border-rule text-muted",
};

export function StageTrack() {
  return (
    <PanelFrame label="Illustration of the nine stages">
      <ul className="flex flex-wrap gap-1.5">
        {STAGES.map(({ name, state = "default" }) => (
          <li
            key={name}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono text-xs leading-none ${STAGE_STYLE[state]}`}
          >
            {name}
          </li>
        ))}
      </ul>
    </PanelFrame>
  );
}

function RowList({ rows }) {
  return (
    <ul>
      {rows.map(({ label, tag, note }) => (
        <li
          key={label}
          className="flex items-center justify-between gap-3 border-t border-rule py-[11px] text-[14.5px] first:border-t-0 first:pt-0.5 last:pb-0.5"
        >
          <span>{label}</span>
          {tag ? (
            <TextBadge tone="accent">{tag}</TextBadge>
          ) : (
            <small className="text-right font-mono text-xs leading-[1.3] text-muted">{note}</small>
          )}
        </li>
      ))}
    </ul>
  );
}

export function DocumentRows() {
  return (
    <PanelFrame label="Illustration of attached documents">
      <RowList rows={DOCUMENT_ROWS} />
    </PanelFrame>
  );
}

export function ScheduleRows() {
  return (
    <PanelFrame label="Illustration of interview rounds and reminders">
      <RowList rows={SCHEDULE_ROWS} />
    </PanelFrame>
  );
}

export function WeeklySpark() {
  return (
    <PanelFrame label="Illustration of applications per week">
      <div className="flex h-[84px] items-end gap-1.5">
        {WEEKLY_BARS.map((height, i) => (
          <span
            key={i}
            style={{ height: `${height}%` }}
            className="block flex-1 rounded-t-[3px] border border-b-0 border-accent bg-accent-soft"
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] leading-none text-muted">
        <span>Applications per week</span>
        <span>last 8 weeks</span>
      </div>
    </PanelFrame>
  );
}