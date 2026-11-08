import Input from "@/components/Input";
import AuthHeader from "@/features/auth/components/AuthHeader";

const NOTICES = {
  resent: {
    text: "If that account needs verifying, we sent a new link.",
    className: "border-accent bg-accent-soft",
  },
  wait: {
    text: "Please wait a minute before asking again.",
    className: "border-info bg-info-soft",
  },
};

export default function VerifyEmailExpired({ status, email, error, onEmailChange, onSubmit }) {
  const notice = NOTICES[status];

  return (
    <>
      <AuthHeader
        title="This link no longer works"
        description="Verification links expire after 24 hours."
      />

      {notice && (
        <p
          role="status"
          className={`mt-6 rounded-md border-l-[3px] px-3.5 py-3 text-[14.5px] ${notice.className}`}
        >
          {notice.text}
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-7 grid gap-5">
        <div className="grid gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            autoComplete="email"
            aria-invalid={Boolean(error)}
            aria-describedby="email-message"
            className="aria-invalid:border-danger"
            required
          />
          <p id="email-message" aria-live="polite" className="min-h-[1.25rem] text-[13px] text-danger">
            {error}
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink bg-ink px-4 text-sm font-medium text-on-ink transition-colors hover:border-accent hover:bg-accent hover:text-on-ink"
        >
          Resend the link
        </button>
      </form>
    </>
  );
}