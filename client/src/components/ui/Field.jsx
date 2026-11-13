import cx from "../../lib/cx";

const normalize = (option) => (typeof option === "string" ? { value: option, label: option } : option);

/**
 * Label + control + help/error text, wired with ids and aria attributes.
 *
 *   <Field id="company" label="Company" required error={errors.company} {...bind("company")} />
 *   <Field as="select" id="stage" label="Stage" options={STAGES} value onChange />
 *   <Field as="textarea" id="note" label="Note" rows={4} help="Up to 4,000 characters." />
 *
 * Any extra prop (value, onChange, type, maxLength, ...) goes to the control.
 * `children` render after the control (e.g. a <datalist>).
 */
export default function Field({
  as = "input",
  id,
  label,
  required,
  hideLabel,
  help,
  error,
  full,
  className,
  controlClassName,
  options = [],
  children,
  ...control
}) {
  const describedBy = [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const props = {
    id,
    required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: cx("field block w-full min-w-0", controlClassName),
    ...control,
  };

  let input;
  if (as === "select") {
    input = (
      <select {...props}>
        {options.map(normalize).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (as === "textarea") {
    input = <textarea {...props} />;
  } else {
    input = <input {...props} />;
  }

  return (
    <div className={cx("grid min-w-0 content-start gap-1.5", full && "col-span-full", className)}>
      <label htmlFor={id} className={cx("text-meta font-medium", hideLabel && "sr-only")}>
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {input}
      {children}
      {help && (
        <small id={`${id}-help`} className="text-xs leading-snug text-muted">
          {help}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} className="text-xs leading-snug text-danger">
          {error}
        </small>
      )}
    </div>
  );
}
