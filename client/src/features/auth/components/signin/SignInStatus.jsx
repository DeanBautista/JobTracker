import Button from "@/components/Button";
import StatusMessage from "@/components/StatusMessage";
import TextLink from "@/components/TextLink";

// UI only. `status` is one of: "notice" | "error" | "locked" | "unverified"
// Anything else renders nothing.
export default function SignInStatus({ status }) {
  switch (status) {
    case "notice":
      return (
        <StatusMessage
          variant="ok"
          icon={<CheckIcon />}
          title="Your password was updated."
        >
          Log in with the new one.
        </StatusMessage>
      );

    case "error":
      return (
        <StatusMessage
          variant="error"
          role="alert"
          icon={<AlertIcon />}
          title="Email or password is incorrect."
        >
          Check both and try again, or{" "}
          <TextLink to="/forgot-password">reset your password</TextLink>.
        </StatusMessage>
      );

    case "locked":
      return (
        <StatusMessage
          variant="error"
          role="alert"
          icon={<LockIcon />}
          title="Too many attempts."
        >
          Log in is paused for 15 minutes. You can{" "}
          <TextLink to="/forgot-password">reset your password</TextLink>{" "}
          instead.
        </StatusMessage>
      );

    case "unverified":
      return (
        <StatusMessage
          variant="info"
          icon={<MailIcon />}
          title="Verify your email first."
        >
          We sent a link to <b>alex@example.com</b>. It works for 24 hours.
          <div className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-2">
            <Button type="button" size="sm">
              Resend the link
            </Button>
            <span className="text-[13px] text-muted">
              You can ask for another link once a minute.
            </span>
          </div>
        </StatusMessage>
      );

    default:
      return null;
  }
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-full">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 9.2l2.4 2.4 4.6-4.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-full">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 5v5M9 12.4v.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-full">
      <rect
        x="3.5"
        y="8"
        width="11"
        height="7.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M6 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" className="size-full">
      <rect
        x="2"
        y="3.5"
        width="14"
        height="11"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3 5.5l6 4.5 6-4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}