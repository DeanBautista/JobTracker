export default function SegmentedControl({ name, legend, options, defaultValue }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-sm font-medium">{legend}</legend>
      <div className="inline-flex max-w-full overflow-hidden rounded-md border border-ink">
        {options.map(({ value, label }, index) => (
          <label key={value} className={`relative ${index > 0 ? "border-l border-ink" : ""}`}>
            <input
              type="radio"
              name={name}
              value={value}
              defaultChecked={value === defaultValue}
              className="peer sr-only"
            />
            <span className="flex min-h-11 cursor-pointer items-center bg-surface px-[18px] text-sm font-medium peer-checked:bg-ink peer-checked:text-on-ink peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-3 peer-focus-visible:outline-accent">
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}