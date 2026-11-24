const COPY = {
  none: { title: "No jobs match these filters", body: "Try removing a filter or searching for something else." },
  empty: { title: "Your board is empty", body: "Add a job and start tracking each stage from one place." },
  error: { title: "Could not load your board", body: "Check your connection and try again. Your jobs are safe." },
};

// variant: "none" | "empty" | "error". Swap for your StateCard / ListState once you've pasted their props.
export default function BoardState({ variant, onClear, onAdd, onRetry }) {
  const { title, body } = COPY[variant];
  return (
    <section
      role={variant === "error" ? "alert" : undefined}
      className="mt-2 rounded-lg border border-dashed border-muted bg-surface px-6 py-14 text-center"
    >
      <h2 className="font-serif text-[1.7rem] leading-[1.15] font-normal tracking-[-0.015em]">{title}</h2>
      <p className="mx-auto mt-3 mb-6 max-w-[46ch] text-muted">{body}</p>
      {variant === "none" && <button type="button" className="btn" onClick={onClear}>Clear filters</button>}
      {variant === "empty" && <button type="button" className="btn btn-primary" onClick={onAdd}>Add your first job</button>}
      {variant === "error" && <button type="button" className="btn btn-primary" onClick={onRetry}>Try again</button>}
    </section>
  );
}
