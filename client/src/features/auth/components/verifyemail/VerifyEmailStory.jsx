const STEPS = [
  { label: "Create your account", status: "done" },
  { label: "Verify your email", status: "now" },
  { label: "Set your weekly goal", status: "next" },
];

const DOT = {
  done: "border-accent-on-ink bg-accent-on-ink text-ink",
  now: "border-accent-on-ink ring-[3px] ring-accent-on-ink/25",
  next: "border-on-ink/40",
};

export default function VerifyEmailStory() {
  return (
    <div>
      <h2 className="max-w-[16ch] font-serif text-[clamp(2rem,3.4vw,3rem)] font-normal leading-[1.08] tracking-[-0.02em]">
        One quick step before you start tracking.
      </h2>
      <p className="mt-4 max-w-[38ch] text-on-ink/75">
        Confirming your email keeps your account recoverable and your reminders reaching you.
      </p>

      <ul className="mt-10 grid max-w-[360px] gap-3.5">
        {STEPS.map(({ label, status }) => (
          <li
            key={label}
            className={`flex items-center gap-3 text-[15px] ${
              status === "now" ? "font-semibold" : status === "next" ? "text-on-ink/60" : ""
            }`}
          >
            <span className={`grid size-[22px] flex-none place-items-center rounded-full border-[1.5px] ${DOT[status]}`}>
              {status === "done" && (
                <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className="size-3">
                  <path d="M2.5 6.2l2.4 2.4 4.6-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}