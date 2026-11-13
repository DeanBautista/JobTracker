import cx from "../../lib/cx";

const TONES = {
  default: "border-rule bg-tint",
  accent: "border-accent bg-accent-soft",
  danger: "border-danger bg-danger-soft",
};

export default function Banner({ tone = "default", action, children }) {
  return (
    <div
      className={cx(
        "mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-meta",
        TONES[tone],
      )}
    >
      <p className="min-w-0">{children}</p>
      {action}
    </div>
  );
}
