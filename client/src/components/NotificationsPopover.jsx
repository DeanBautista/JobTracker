import { useRef } from "react";
import { Link } from "react-router-dom";

// Placeholder data until notifications have an API
const PLACEHOLDER = [
  { id: 101, title: "Follow up with Northwind", detail: "Frontend Developer · overdue", unread: true },
  { id: 102, title: "Interview with Orchard Labs today", detail: "Technical round · 14:00", unread: true },
  { id: 103, title: "Kestrel Pay: apply by Friday", detail: "Junior Full Stack · deadline in 2 days", unread: true },
];

export default function NotificationsPopover({ notifications = PLACEHOLDER }) {
  const panelRef = useRef(null);
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <>
      <button
        type="button"
        popoverTarget="bell-panel"
        aria-label={`Notifications, ${unread} unread`}
        className="relative inline-grid size-10 cursor-pointer place-items-center rounded-md border border-rule bg-surface hover:border-ink"
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-[18px]">
          <path
            d="M5 8a5 5 0 0 1 10 0c0 4 1.5 5.5 1.5 5.5h-13S5 12 5 8zM8.5 16.5a1.6 1.6 0 0 0 3 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unread > 0 && (
          <b
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 min-w-[18px] rounded-full bg-danger px-[5px] py-px text-center font-mono text-[10.5px] leading-[1.4] font-medium text-on-ink"
          >
            {unread}
          </b>
        )}
      </button>

      <div
        ref={panelRef}
        id="bell-panel"
        popover="auto"
        className="top-18 right-6 bottom-auto left-auto m-0 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-[10px] border border-ink bg-surface p-0 text-ink"
      >
        <div className="border-b border-rule px-4 py-3.5">
          <h2 className="font-serif text-[1.05rem] leading-none font-medium">Notifications</h2>
        </div>
        <ul>
          {notifications.map(({ id, title, detail, unread: isUnread }) => (
            <li key={id} className="border-b border-rule last:border-b-0">
              <Link
                to={`/jobs/${id}`}
                onClick={() => panelRef.current?.hidePopover()}
                className="block px-4 py-3 text-sm no-underline hover:bg-tint"
              >
                {isUnread && (
                  <span aria-hidden="true" className="mr-2 inline-block size-[7px] rounded-full bg-accent" />
                )}
                {title}
                <small className="mt-0.5 block text-[12.5px] text-muted">{detail}</small>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}