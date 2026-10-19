const STEPS = [
  {
    title: "Confirm your email",
    description: "We send one link. It works for 24 hours.",
  },
  {
    title: "Set a weekly goal",
    description: "Pick a number, or skip it.",
  },
  {
    title: "Add your first job",
    description: "It shows up on the board right away.",
  },
];

// Content for the dark panel on the sign up page.
export default function SignUpStory() {
  return (
    <div>
      <span className="font-mono text-[11.5px] font-medium uppercase leading-tight tracking-[0.08em] text-on-ink/60">
        Free account
      </span>

      <h2 className="mt-3.5 max-w-[13ch] font-serif text-[clamp(2rem,3.4vw,3.1rem)] font-normal leading-[1.06] tracking-[-0.025em]">
        Start tracking in{" "}
        <em className="italic text-accent-on-ink">a minute.</em>
      </h2>

      <p className="mt-4 max-w-[38ch] text-on-ink/75">
        One place for every application, the resume you sent, and the reminders
        that stop a job going cold.
      </p>

      <ol
        aria-label="What happens next"
        className="mt-8.5 max-w-[400px] border-t border-on-ink/25"
      >
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="grid grid-cols-[34px_1fr] gap-x-2 gap-y-1 border-b border-on-ink/15 py-4"
          >
            <span className="row-span-2 font-mono text-xs font-medium leading-[1.9] text-accent-on-ink">
              0{index + 1}
            </span>
            <p className="font-medium">{step.title}</p>
            <p className="text-sm text-on-ink/65">{step.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}