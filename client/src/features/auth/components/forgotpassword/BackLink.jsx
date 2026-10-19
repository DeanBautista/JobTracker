import { Link } from "react-router-dom";

export default function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="mb-5.5 inline-flex items-center gap-2 text-[14.5px] text-muted no-underline hover:text-ink"
    >
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4">
        <path
          d="M10 3L5 8l5 5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </Link>
  );
}