const STEPS = [
  { title: "Enter your email", description: "The one you signed up with." },
  { title: "Open the link we send", description: "It works once, for 30 minutes." },
  { title: "Choose a new password", description: "Then log in as usual." },
];

const delay = (ms) => ({ animationDelay: `${ms}ms` });

export default function ForgotPasswordStory() {
  return (
    <div className="flex h-full flex-col justify-between gap-12">
      <div>
        <span className="block animate-rise font-mono text-[11.5px] font-medium uppercase tracking-[0.08em] text-on-ink/60">
          Account help
        </span>

        <h2
          style={delay(40)}
          className="mt-3.5 max-w-[13ch] animate-rise font-serif text-[clamp(2rem,3.4vw,3.1rem)] leading-[1.06] tracking-tight"
        >
          It happens. <em className="text-accent-on-ink">Let&apos;s get you back in.</em>
        </h2>

        <p style={delay(80)} className="mt-4 max-w-[38ch] animate-rise text-on-ink/75">
          Your jobs and files are safe. A new password takes about a minute.
        </p>

        <ol
          aria-label="How a reset works"
          style={delay(120)}
          className="mt-8 max-w-100 animate-rise border-t border-on-ink/25"
        >
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              style={delay(320 + Math.min(index, 5) * 40)}
              className="grid animate-rise grid-cols-[34px_1fr] gap-x-2 gap-y-1 border-b border-on-ink/15 py-4"
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

      <p
        style={delay(460)}
        className="animate-rise font-mono text-xs leading-snug text-on-ink/55"
      >
        Signed in with Google or GitHub? You do not need a password.
      </p>
    </div>
  );
}