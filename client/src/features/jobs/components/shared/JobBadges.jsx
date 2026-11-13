import { optionLabel } from "../../utils/jobOptions";

const STAGE_DOT = {
  applied: "bg-ink",
  screening: "bg-accent",
  interview: "bg-accent",
  offer: "bg-accent",
};

export function StageBadge({ stage }) {
  const isOffer = stage === "offer";

  return (
    <span
      className={`inline-flex items-center gap-[7px] rounded-full border py-[3px] pr-2.5 pl-2 text-[13px] font-medium whitespace-nowrap ${
        isOffer ? "border-accent bg-accent-soft text-accent" : "border-rule bg-paper"
      }`}
    >
      <span aria-hidden="true" className={`size-[7px] rounded-full ${STAGE_DOT[stage] ?? "bg-muted"}`} />
      {optionLabel(stage)}
    </span>
  );
}

const PRIORITY_DOT = { high: "bg-danger", medium: "bg-accent", low: "bg-rule" };

export function PriorityBadge({ priority }) {
  return (
    <span className="inline-flex items-center gap-[7px] text-[13.5px] whitespace-nowrap">
      <span aria-hidden="true" className={`size-2 rounded-[2px] ${PRIORITY_DOT[priority]}`} />
      {optionLabel(priority)}
    </span>
  );
}

export function ReminderTag({ label, late }) {
  return (
    <span
      className={`inline-block max-w-[190px] rounded-sm px-2 py-0.5 font-mono text-[11px] leading-[1.5] font-medium ${
        late ? "bg-danger-soft text-danger" : "bg-tint text-muted"
      }`}
    >
      {label}
    </span>
  );
}