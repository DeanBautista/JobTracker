const SAMPLE_ITEMS = [
  { label: "Follow up: Northwind", when: "2 days overdue", isLate: true },
  { label: "Orchard Labs, technical round", when: "today 14:00" },
  { label: "Kestrel Pay, apply by Friday", when: "in 2 days" },
];

const delay = (ms) => ({ animationDelay: `${ms}ms` });

// Content for the dark panel on the sign in page.
export default function SignInStory() {
  return (
    <div>
      <span
        className="block animate-rise font-mono text-[11.5px] font-medium uppercase leading-tight tracking-[0.08em] text-on-ink/60"
      >
        Welcome back
      </span>

      <h2
        style={delay(40)}
        className="mt-3.5 max-w-[13ch] animate-rise font-serif text-[clamp(2rem,3.4vw,3.1rem)] font-normal leading-[1.06] tracking-[-0.025em]"
      >
        Pick up where you <em className="italic text-accent-on-ink">left off.</em>
      </h2>

      <p style={delay(80)} className="mt-4 max-w-[38ch] animate-rise text-on-ink/75">
        Your board, your files and your reminders are right where you left them.
      </p>

      <div
        role="img"
        aria-label="Example of the needs-attention list that waits after you log in"
        style={delay(120)}
        className="mt-9 max-w-[420px] animate-rise overflow-hidden rounded-[10px] border border-on-ink/28 bg-on-ink/6"
      >
        <div className="flex justify-between border-b border-on-ink/18 px-4 py-[11px] font-mono text-[11.5px] font-medium uppercase leading-tight tracking-[0.08em] text-on-ink/65">
          <span>Needs attention</span>
          <span>Sample</span>
        </div>

        <ul>
          {SAMPLE_ITEMS.map((item, i) => (
            <li
              key={item.label}
              style={delay(320 + Math.min(i, 5) * 40)}
              className="flex animate-rise items-center justify-between gap-4 border-t border-on-ink/14 px-4 py-3 text-[14.5px] first:border-t-0"
            >
              <span>{item.label}</span>
              <small
                className={`whitespace-nowrap font-mono text-xs leading-none ${
                  item.isLate ? "text-danger-on-ink" : "text-on-ink/62"
                }`}
              >
                {item.when}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}