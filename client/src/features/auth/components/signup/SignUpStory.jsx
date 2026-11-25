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

const delay = (ms) => ({ animationDelay: `${ms}ms` });

// Content for the dark panel on the sign up page.
export default function SignUpStory() {
  return (
    <div>
      <span className="block animate-rise font-mono text-[11.5px] font-medium uppercase leading-tight tracking-[0.08em] text-on-ink/60">
        Free account
      </span>

      <h2
        style={delay(40)}
        className="mt-3.5 max-w-[13ch] animate-rise font-serif text-[clamp(2rem,3.4vw,3.1rem)] font-normal leading-[1.06] tracking-[-0.025em]"
      >
        Start tracking in{" "}
        <em className="italic text-accent-on-ink">a minute.</em>
      </h2>

      <p
        style={delay(80)}
        className="mt-4 max-w-[38ch] animate-rise text-on-ink/75"
      >
        One place for every application, the resume you sent, and the reminders
        that stop a job going cold.
      </p>

      <ol
        aria-label="What happens next"
        style={delay(120)}
        className="mt-8.5 max-w-[400px] animate-rise border-t border-on-ink/25"
      >
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            style={delay(320 + Math.min(index, 5) * 40)}
            className="grid animate-rise grid-cols-[34px_1fr] gap-x-2 gap-y-1 border-b border-on-ink/15 py-4"
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