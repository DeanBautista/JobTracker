import { Link } from "react-router-dom";

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
    to: "/jobs/new",
    primary: true,
  },
  error: {
    title: "Could not load your jobs",
    text: "Check your connection and try again. Your jobs are safe.",
    label: "Try again",
    to: "/jobs",
    primary: true,
  },
};

export default function ListState({ variant }) {
  const { title, text, label, to, primary } = STATES[variant];

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
      <Link to={to} className={`btn ${primary ? "btn-primary" : ""}`}>{label}</Link>
    </section>
  );
}