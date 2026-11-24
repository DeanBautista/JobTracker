export const RANGES = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "all", label: "All time" },
];

export default function RangePicker({ value, onChange }) {
  return (
    <fieldset
        aria-label="Date range"
        className="m-0 inline-flex shrink-0 overflow-hidden rounded-md border border-ink p-0 max-sm:w-full"
      >
      {RANGES.map((range) => (
        <label
          key={range.value}
          className="inline-flex min-h-[38px] flex-1 cursor-pointer items-center justify-center border-l border-ink bg-surface px-3.5 text-center text-sm font-medium whitespace-nowrap first:border-l-0 has-checked:bg-ink has-checked:text-on-ink has-focus-visible:outline-2 has-focus-visible:-outline-offset-3 has-focus-visible:outline-accent"
        >
          <input
            type="radio"
            name="range"
            value={range.value}
            checked={value === range.value}
            onChange={() => onChange(range.value)}
            className="sr-only"
          />
          {range.label}
        </label>
      ))}
    </fieldset>
  );
}
