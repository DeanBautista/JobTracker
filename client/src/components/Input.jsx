const normalStyles = "border-muted hover:border-ink focus-visible:border-ink";
const errorStyles = "border-danger";

// `error`   – message string for this field; links the input to the message
//             rendered by <FormField />.
// `invalid` – red border only, for errors that don't belong to one field
//             (e.g. "Email or password is incorrect").
export default function Input({
  error,
  invalid = false,
  className = "",
  ...props
}) {
  const isInvalid = invalid || Boolean(error);

  return (
    <input
      aria-invalid={isInvalid || undefined}
      {...props}
      aria-describedby={error ? `${props.id}-error` : props["aria-describedby"]}
      className={`min-h-12 w-full rounded-md border bg-surface px-3.5 text-base leading-none text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${
        isInvalid ? errorStyles : normalStyles
      } ${className}`}
    />
  );
}