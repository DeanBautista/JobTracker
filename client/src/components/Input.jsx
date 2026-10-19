const normalStyles = "border-muted hover:border-ink focus-visible:border-ink";
const errorStyles = "border-danger";

// `error` is the message string. When set, the input turns red and points
// screen readers to the matching message rendered by <FormField />.
export default function Input({ error, className = "", ...props }) {
  return (
    <input
      aria-invalid={error ? true : undefined}
      {...props}
      aria-describedby={error ? `${props.id}-error` : props["aria-describedby"]}
      className={`min-h-12 w-full rounded-md border bg-surface px-3.5 text-base leading-none text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${
        error ? errorStyles : normalStyles
      } ${className}`}
    />
  );
}