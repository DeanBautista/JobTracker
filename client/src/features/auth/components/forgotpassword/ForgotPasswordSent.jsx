import Button from "@/components/Button";

export default function ForgotPasswordSent({ email, onResend, onChangeEmail }) {
  return (
    <section role="status" aria-labelledby="sent-title">
      <div className="mb-5 grid size-13 place-items-center rounded-full border border-ink">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-6">
          <rect x="2.5" y="4.5" width="19" height="15" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </div>

      <h1
        id="sent-title"
        className="font-serif text-[clamp(2rem,3.4vw,2.6rem)] leading-[1.08] tracking-tight"
      >
        Check your inbox
      </h1>
      <p className="mt-2.5 text-muted">If an account exists for</p>

      <p className="mt-4.5 break-all rounded-md border border-rule bg-surface px-3.5 py-3 font-mono text-sm font-medium">
        {email}
      </p>

      <p className="mt-4 text-muted">
        we have sent a link to reset the password. It works once and expires in
        30 minutes.
      </p>

      <div className="mt-5.5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
        <Button to="/signin">Back to log in</Button>
        <Button variant="outline" type="button" onClick={onResend}>
          Send again
        </Button>
      </div>

      <p className="mt-5.5 border-t border-rule pt-4.5 text-sm text-muted">
        Nothing after a few minutes? Check spam, or{" "}
        <button type="button" onClick={onChangeEmail} className="underline underline-offset-3 hover:decoration-2">
          try another email
        </button>
        . You can ask for a new link once a minute.
      </p>
    </section>
  );
}