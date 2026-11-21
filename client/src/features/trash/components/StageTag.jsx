import { STAGE_LABELS, isClosedStage } from "@/features/jobs/utils/jobOptions";

const base =
  "inline-block rounded-sm px-2 py-0.5 font-mono text-[10.5px] leading-normal font-medium tracking-[0.05em] whitespace-nowrap uppercase";

function variant(stage) {
  if (stage === "accepted") return "bg-accent-soft text-accent";
  if (isClosedStage(stage)) return "border border-dashed border-muted text-muted";
  return "bg-tint text-ink";
}

export default function StageTag({ stage }) {
  return <span className={`${base} ${variant(stage)}`}>{STAGE_LABELS[stage] ?? stage}</span>;
}

export function DaysLeftTag({ days }) {
  if (days > 3) return <span className="font-mono text-[13px] text-muted">{days} days</span>;
  return (
    <span className={`${base} bg-danger-soft text-danger`}>
      {days} {days === 1 ? "day" : "days"} left
    </span>
  );
}
