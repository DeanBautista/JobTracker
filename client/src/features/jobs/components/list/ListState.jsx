import { Link } from "react-router-dom";
import useAddJob from "../../hooks/useAddJob";

const STATES = {
  none: {
    title: "No jobs match these filters",
    text: "Try removing a filter or searching for something else.",
    label: "Clear filters",
    to: "/jobs",
    primary: false,
  },
  empty: {
    title: "No jobs yet",
    text: "Add your first job and it will appear here and on the board.",
    label: "Add your first job",
    action: "add",
    primary: true,
  },
  error: {
    title: "Could not load your jobs",
    text: "Check your connection and try again. Your jobs are safe.",
    label: "Try again",
    action: "retry",
    primary: true,
  },
};

export default function ListState({ variant, onRetry }) {
  const { openAddJob } = useAddJob();
  const { title, text, label, to, action, primary } = STATES[variant];
  const className = `btn ${primary ? "btn-primary" : ""}`;

  return (
    <section
      role={variant === "error" ? "alert" : undefined}
      aria-labelledby="list-state-title"
      className="rounded-lg border border-dashed border-muted bg-surface px-6 py-14 text-center"
    >
      <h2 id="list-state-title" className="font-serif text-[1.7rem] leading-[1.15] font-normal tracking-[-0.015em]">
        {title}
      </h2>
      <p className="mx-auto mt-3 mb-6 max-w-[46ch] text-muted">{text}</p>

      {to && <Link to={to} className={className}>{label}</Link>}
      {action === "add" && (
        <button type="button" onClick={openAddJob} className={className}>{label}</button>
      )}
      {action === "retry" && (
        <button type="button" onClick={onRetry} className={className}>{label}</button>
      )}
    </section>
  );
}