import { Link } from "react-router-dom";

export default function OnboardingHeader({ onSkip, disabled }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-rule px-gutter">
      <Link to="/" aria-label="Job Tracker home" className="flex items-center gap-2.5 font-serif text-[19px] leading-none font-medium tracking-[-0.01em]">
        <svg viewBox="0 0 26 26" fill="none" aria-hidden="true" className="size-[26px]">
          <rect x="1.5" y="1.5" width="23" height="23" rx="5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7 8h5M7 13h12M7 18h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Job Tracker
      </Link>
      <button
        type="button"
        onClick={onSkip}
        disabled={disabled}
        className="text-sm underline-offset-4 hover:underline disabled:opacity-50"
      >
        Skip for now
      </button>
    </header>
  );
}