import cx from "../../../lib/cx";
import { STAGE_LABELS } from "../utils/detailOptions";

const FILLED = ["offer", "accepted"];
const ACTIVE_DOT = ["interview", "screening", "offer", "accepted"];

// (If JobBadges.jsx already has a stage badge with the same look, use it instead.)
export default function StageTag({ stage }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-[7px] rounded-full border px-2.5 py-1 text-xs font-medium",
        FILLED.includes(stage) ? "border-accent bg-accent-soft text-accent" : "border-rule bg-surface",
      )}
    >
      <span aria-hidden="true" className={cx("size-[7px] rounded-full", ACTIVE_DOT.includes(stage) ? "bg-accent" : "bg-muted")} />
      {STAGE_LABELS[stage] ?? stage}
    </span>
  );
}
