const WIDTHS = ["92%", "74%", "86%", "62%", "80%"];

export default function JobsSkeleton() {
  return (
    <div role="status" aria-label="Loading jobs" className="rounded-lg border border-rule bg-surface py-2">
      {WIDTHS.map((width) => (
        <div
          key={width}
          style={{ width }}
          className="mx-4 my-[18px] h-3.5 rounded-[7px] bg-tint motion-safe:animate-pulse"
        />
      ))}
    </div>
  );
}