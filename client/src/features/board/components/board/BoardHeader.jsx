import { NavLink } from "react-router-dom";

const seg = ({ isActive }) =>
  `inline-flex min-h-[38px] items-center px-4 text-sm font-medium no-underline ${
    isActive ? "bg-ink text-on-ink" : "bg-surface hover:bg-tint"
  } [&+&]:border-l [&+&]:border-ink`;

export default function BoardHeader({ openTotal, openMatches, hasFilters }) {
  const noun = openTotal === 1 ? "job" : "jobs";
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 max-[700px]:items-start max-sm:mb-4">
      <div>
        <h1 className="font-serif text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.1] font-normal tracking-[-0.02em]">Board</h1>
        <p className="mt-1.5 text-muted max-sm:text-sm">
          {hasFilters ? `${openMatches} of ${openTotal} open ${noun} match` : `${openTotal} open ${noun}`}
          {" · keep every opportunity moving"}
        </p>
      </div>
      {/* Swap for your SegmentedControl if it renders links. */}
      <nav aria-label="View" className="inline-flex overflow-hidden rounded-md border border-ink max-[700px]:hidden">
        <NavLink to="/board" end className={seg}>Board</NavLink>
        <NavLink to="/jobs" end className={seg}>List</NavLink>
      </nav>
    </div>
  );
}
