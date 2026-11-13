import cx from "../../lib/cx";

const WIDTHS = ["w-full", "w-[68%]", "w-[88%]", "w-[47%]", "w-[74%]"];

export default function SkeletonCard({ lines = 4, className }) {
  return (
    <div aria-hidden="true" className={cx("rounded-lg border border-rule bg-surface p-5", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <i key={i} className={cx("mb-5 block h-3.5 rounded-lg bg-tint motion-safe:animate-pulse", WIDTHS[i % WIDTHS.length])} />
      ))}
    </div>
  );
}
