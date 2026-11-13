import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/context/useAuth";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/board", label: "Board" },
  { to: "/jobs", label: "List" },
  { to: "/reminders", label: "Reminders", count: 3 }, // placeholder count
  { to: "/trash", label: "Archive & Trash" },
  { to: "/settings", label: "Settings" },
];

const linkBase =
  "relative flex min-h-10 items-center justify-between gap-2.5 rounded-md px-2.5 font-medium no-underline";
const linkActive =
  "bg-tint text-ink before:absolute before:inset-y-2 before:-left-3.5 before:w-[3px] before:rounded-r-[3px] before:bg-accent";
const linkIdle = "text-muted hover:bg-tint hover:text-ink";

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-55 cursor-default bg-black/45 shell:hidden"
        />
      )}

      <aside
        aria-label="Main"
        className={`fixed top-0 bottom-0 left-0 z-60 flex w-[min(290px,84vw)] flex-col overflow-y-auto border-r border-rule bg-surface px-3.5 pt-5 pb-4 transition-transform duration-200 motion-reduce:transition-none shell:sticky shell:bottom-auto shell:h-screen shell:w-auto shell:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-[102%]"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3 inline-flex min-h-[34px] cursor-pointer items-center rounded-md border border-rule px-2.5 text-[13px] shell:hidden"
        >
          Close
        </button>

        <Link
          to="/dashboard"
          aria-label="Job Tracker home"
          className="mb-[26px] flex items-center gap-2.5 px-2 font-serif text-[19px] leading-none font-medium tracking-[-0.01em] no-underline"
        >
          <svg viewBox="0 0 26 26" fill="none" aria-hidden="true" className="size-[26px]">
            <rect x="1.5" y="1.5" width="23" height="23" rx="5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7 8h5M7 13h12M7 18h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Job Tracker
        </Link>

        <nav aria-label="Pages" className="grid gap-0.5">
          {LINKS.map(({ to, label, count }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
            >
              {label}
              {count > 0 && (
                <span
                  aria-label={`${count} due`}
                  className="min-w-[22px] rounded-full bg-ink px-[7px] py-0.5 text-center font-mono text-[11px] leading-[1.4] font-medium text-on-ink"
                >
                  {count}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-2.5 border-t border-rule px-2 pt-4">
          <div
            aria-hidden="true"
            className="grid size-[34px] flex-none place-items-center rounded-full bg-accent-soft font-serif text-sm font-medium text-accent"
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <strong className="block text-sm leading-[1.3] font-medium">{user?.name}</strong>
            <button
              type="button"
              onClick={logout}
              className="cursor-pointer text-[13px] text-muted underline underline-offset-3 hover:text-ink"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}