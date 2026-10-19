// Label + input + (hint or error message).
// The hint is replaced by the error when there is one.
// `aside` sits on the right of the label row (e.g. a "Forgot password?" link).
export default function FormField({
  id,
  label,
  aside,
  hint,
  error,
  children,
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
        </label>
        {aside && <span className="text-[13.5px]">{aside}</span>}
      </div>

      {children}

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13.5px] text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-[13.5px] text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}