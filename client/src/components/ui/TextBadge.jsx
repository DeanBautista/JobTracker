import cx from "../../lib/cx";

const TONES = {
  default: "border-rule bg-paper",
  accent: "border-accent bg-accent-soft text-accent",
  danger: "border-danger bg-danger-soft text-danger",
};

export default function TextBadge({ tone = "default", children }) {
  return (
    <span
      className={cx(
        "inline-flex min-h-6 items-center justify-center gap-1 rounded-full border px-2 py-[3px] text-[11.5px] font-medium whitespace-nowrap",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}
