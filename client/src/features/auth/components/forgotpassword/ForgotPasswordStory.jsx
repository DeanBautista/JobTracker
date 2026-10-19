const STEPS = [
  { title: "Enter your email", description: "The one you signed up with." },
  { title: "Open the link we send", description: "It works once, for 30 minutes." },
  { title: "Choose a new password", description: "Then log in as usual." },
];

export default function ForgotPasswordStory() {
  return (
    <div className="flex h-full flex-col justify-between gap-12">
      <div>
        <span className="font-mono text-[11.5px] font-medium uppercase tracking-[0.08em] text-on-ink/60">
          Account help
        </span>

        <h2 className="mt-3.5 max-w-[13ch] font-serif text-[clamp(2rem,3.4vw,3.1rem)] leading-[1.06] tracking-tight">
          It happens. <em className="text-accent-on-ink">Let&apos;s get you back in.</em>
        </h2>

        <p className="mt-4 max-w-[38ch] text-on-ink/75">
          Your jobs and files are safe. A new password takes about a minute.
        </p>

        <ol
          aria-label="How a reset works"
          className="mt-8 max-w-100 border-t border-on-ink/25"
        >
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[34px_1fr] gap-x-2 gap-y-1 border-b border-on-ink/15 py-4"
            >
              <span className="row-span-2 font-mono text-xs font-medium leading-[1.9] text-accent-on-ink">
                {String(index + 1).padStart(2, "0")}
              </span>
              <b className="font-medium">{step.title}</b>
              <span className="text-sm text-on-ink/65">{step.description}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="font-mono text-xs leading-snug text-on-ink/55">
        Signed in with Google or GitHub? You do not need a password.
      </p>
    </div>
  );
}