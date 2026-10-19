// Label + input + (hint or error message).
// The hint is replaced by the error when there is one.
export default function FormField({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>

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