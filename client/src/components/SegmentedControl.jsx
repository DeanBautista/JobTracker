// Works uncontrolled (defaultValue) or controlled (value + onChange).
// `hideLegend` keeps the legend for screen readers only.
export default function SegmentedControl({
  name,
  legend,
  hideLegend = false,
  options,
  defaultValue,
  value,
  onChange,
}) {
  const controlled = value !== undefined;

  return (
    <fieldset className="min-w-0">
      <legend className={hideLegend ? "sr-only" : "mb-1.5 text-sm font-medium"}>{legend}</legend>
      <div className="inline-flex max-w-full overflow-hidden rounded-md border border-ink">
        {options.map((option, index) => (
          <label key={option.value} className={`relative ${index > 0 ? "border-l border-ink" : ""}`}>
            <input
              type="radio"
              name={name}
              value={option.value}
              {...(controlled
                ? { checked: String(value) === String(option.value), onChange: () => onChange?.(option.value) }
                : { defaultChecked: option.value === defaultValue })}
              className="peer sr-only"
            />
            <span className="flex min-h-11 cursor-pointer items-center bg-surface px-[18px] text-sm font-medium peer-checked:bg-ink peer-checked:text-on-ink peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-3 peer-focus-visible:outline-accent">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}