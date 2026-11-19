const COLUMNS = [
  [[65, 90, 48], [80, 56]], [[65, 82, 47], [74]], [[70, 85, 50], [60, 80]],
  [[65, 90, 48]], [[75, 60, 40], [66, 88]], [[80], [55]],
];

export default function BoardSkeleton() {
  return (
    <div role="status" aria-label="Loading board" className="flex w-max min-w-full gap-3 pt-0.5 pb-4">
      {COLUMNS.map((cards, i) => (
        <div key={i} className="min-h-80 w-[226px] rounded-lg border border-rule bg-surface p-3.5 max-[700px]:w-[236px]">
          <div className="mb-[15px] h-[13px] rounded-full bg-tint motion-safe:animate-pulse" style={{ width: `${50 + ((i * 9) % 25)}%` }} />
          {cards.map((lines, j) => (
            <div key={j} className="mt-3 h-[150px] rounded-lg border border-rule p-3.5">
              {lines.map((w, k) => (
                <i key={k} className="my-2.5 block h-2.5 rounded-md bg-tint not-italic motion-safe:animate-pulse" style={{ width: `${w}%` }} />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
