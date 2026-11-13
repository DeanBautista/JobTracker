import { NavLink, useLocation } from "react-router-dom";
import { SORT_LABELS } from "../../utils/jobOptions";

const VIEWS = [
  { to: "/board", label: "Board" },
  { to: "/jobs", label: "List" },
];

export default function JobsHeader({ total, hasFilters, sort, dir }) {
  const { search } = useLocation(); // Board/List switch keeps the query

  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div>
        <h1 className="font-serif text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.1] font-normal tracking-[-0.02em]">
          List
        </h1>
        <p className="mt-1.5 text-muted">
          {total} {hasFilters ? (total === 1 ? "job matches" : "jobs match") : total === 1 ? "job" : "jobs"} ·
          sorted by {SORT_LABELS[sort]}, {dir === "asc" ? "ascending" : "descending"}
        </p>
      </div>

      <nav aria-label="View" className="inline-flex overflow-hidden rounded-md border border-ink">
        {VIEWS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={{ pathname: to, search }}
            className={({ isActive }) =>
              `inline-flex min-h-[38px] items-center px-4 text-sm font-medium no-underline not-first:border-l not-first:border-ink ${
                isActive ? "bg-ink text-on-ink" : "bg-surface hover:bg-tint"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}