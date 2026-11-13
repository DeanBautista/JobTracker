import { NavLink } from "react-router-dom";
import { useAddJob } from "@/features/jobs";

const TABS = [
  { to: "/dashboard", label: "Home" },
  { to: "/board", label: "Board" },
  { to: "/jobs", label: "List" },
  { to: "/reminders", label: "Alerts" },
];

export default function MobileTabBar() {
  const { openAddJob } = useAddJob();

  return (
    <nav
      aria-label="Quick links"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-[repeat(4,1fr)_64px] border-t border-rule bg-surface sm:hidden"
    >
      {TABS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex min-h-14 items-center justify-center px-1 text-xs no-underline ${
              isActive
                ? "font-semibold text-ink shadow-[inset_0_2px_0_var(--color-accent)]"
                : "text-muted"
            }`
          }
        >
          {label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={openAddJob}
        aria-label="Add job"
        aria-haspopup="dialog"
        className="flex cursor-pointer items-center justify-center bg-ink text-[1.6rem] leading-none text-on-ink"
      >
        +
      </button>
    </nav>
  );
}