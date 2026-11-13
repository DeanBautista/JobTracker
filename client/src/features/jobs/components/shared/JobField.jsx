import { useId } from "react";

// Label + control + hint + error, wired together for screen readers.
// `children` is a render function that receives the props to spread on the control.
export default function JobField({ label, hint, error, compact = false, className = "", children }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={`mb-1.5 block ${compact ? "text-[13px] text-muted" : "text-sm font-medium"}`}
      >
        {label}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {hint && (
        <small id={hintId} className="mt-1.5 block text-[13px] text-muted">
          {hint}
        </small>
      )}
      {error && (
        <span id={errorId} className="mt-1.5 block text-[13px] font-medium text-danger">
          {error}
        </span>
      )}
    </div>
  );
}