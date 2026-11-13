import { Link } from "react-router-dom";
import cx from "../../../lib/cx";

// Tabs wrap onto a second row on narrow screens instead of scrolling sideways.
export default function JobTabs({ tabs, active, counts }) {
  return (
    <nav aria-label="Job details tabs" className="mb-5 flex flex-wrap gap-x-1 border-b border-rule">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        const count = tab.countKey ? counts[tab.countKey] : null;
        return (
          <Link
            key={tab.key}
            to={`?tab=${tab.key}`}
            aria-current={isActive ? "page" : undefined}
            className={cx(
              "-mb-px inline-flex min-h-11 items-center gap-1.5 border-b-2 px-3 text-[13.5px] whitespace-nowrap no-underline hover:bg-tint hover:text-ink",
              isActive ? "border-accent font-semibold text-ink" : "border-transparent text-muted",
            )}
          >
            {tab.label}
            {count !== null && (
              <span className="inline-grid h-[19px] min-w-[19px] place-items-center rounded-full bg-tint px-[5px] font-mono text-[10.5px] font-medium text-muted">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
