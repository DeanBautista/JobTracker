import cx from "../../../lib/cx";

const DOT = { high: "bg-danger", medium: "bg-accent", low: "bg-rule" };
const LABEL = { high: "High priority", medium: "Medium priority", low: "Low priority" };

export default function PriorityTag({ priority }) {
  return (
    <span className="inline-flex items-center gap-[7px] text-meta">
      <span aria-hidden="true" className={cx("size-2 rounded-[2px]", DOT[priority] ?? "bg-rule")} />
      {LABEL[priority] ?? priority}
    </span>
  );
}
