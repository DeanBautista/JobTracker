import { Link } from "react-router-dom";
import AuthHeader from "@/features/auth/components/AuthHeader";

export default function VerifyEmailSuccess() {
  return (
    <>
      <div className="mb-6 grid size-12 place-items-center rounded-full bg-accent-soft text-accent" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" className="size-6">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <AuthHeader title="Email verified" description="You are all set." />

      <Link
        to="/onboarding"
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md border border-ink bg-ink px-4 text-sm font-medium text-on-ink transition-colors hover:border-accent hover:bg-accent hover:text-on-ink"
      >
        Continue
      </Link>
    </>
  );
}