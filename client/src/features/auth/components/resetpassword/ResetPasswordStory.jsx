const STAGES = [
  { label: "Applied", width: "100%", count: 24 },
  { label: "Screening", width: "54%", count: 13 },
  { label: "Interview", width: "29%", count: 7 },
  { label: "Offer", width: "8%", count: 2 },
];

const delay = (ms) => ({ animationDelay: `${ms}ms` });

export default function ResetPasswordStory() {
  return (
    <div>
      <h2 className="max-w-[16ch] animate-rise font-serif text-[clamp(2rem,3.4vw,3rem)] font-normal leading-[1.08] tracking-[-0.02em]">
        Know where every application stands.
      </h2>
      <p style={delay(40)} className="mt-4 max-w-[38ch] animate-rise text-on-ink/75">
        From the first apply to the final offer, each job and each reply in one place.
      </p>

      <ul className="mt-10 grid max-w-[420px] gap-3">
        {STAGES.map(({ label, width, count }, i) => (
          <li
            key={label}
            style={delay(120 + Math.min(i, 5) * 40)}
            className="grid animate-rise grid-cols-[84px_1fr_28px] items-center gap-3 text-sm"
          >
            <span>{label}</span>
            <span className="h-2 overflow-hidden rounded-full bg-on-ink/15">
              <span
                className="block h-full origin-left animate-grow bg-accent-on-ink"
                style={{ width, ...delay(200 + Math.min(i, 5) * 40) }}
              />
            </span>
            <b className="text-right font-mono text-[13px] font-medium">{count}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}