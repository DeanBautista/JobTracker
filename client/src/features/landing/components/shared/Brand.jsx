import { Link } from "react-router-dom";

export default function Brand() {
  return (
    <Link
      to="/"
      aria-label="Job Tracker home"
      className="flex items-center gap-2.5 font-serif text-[19px] leading-none font-medium tracking-[-0.01em] no-underline"
    >
      <svg viewBox="0 0 26 26" fill="none" aria-hidden="true" className="size-[26px]">
        <rect x="1.5" y="1.5" width="23" height="23" rx="5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 8h5M7 13h12M7 18h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      Job Tracker
    </Link>
  );
}
