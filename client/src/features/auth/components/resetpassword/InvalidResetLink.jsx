import { Link } from "react-router-dom";
import AuthHeader from "@/features/auth/components/AuthHeader";

export default function InvalidResetLink() {
  return (
    <>
      <AuthHeader
        title="This link no longer works"
        description="Reset links expire after 30 minutes and work once."
      />

      <Link
        to="/forgot-password"
        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md border border-ink bg-ink px-4 text-sm font-medium text-on-ink transition-colors hover:border-accent hover:bg-accent hover:text-on-ink"
      >
        Send a new link
      </Link>
    </>
  );
}