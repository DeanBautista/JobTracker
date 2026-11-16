import { GOAL_PRESETS } from "../utils/validate";

export default function GoalChips({ value, onChange }) {
  return (
    <fieldset className="m-0 flex gap-2 border-0 p-0">
      <legend className="sr-only">Quick pick</legend>
      {GOAL_PRESETS.map((n) => (
        <label key={n} className="relative">
          <input
            type="radio"
            name="weekly_goal_preset"
            value={n}
            checked={Number(value) === n}
            onChange={() => onChange(String(n))}
            className="peer absolute inset-0 cursor-pointer opacity-0"
          />
          <span className="inline-flex min-h-10 min-w-12 items-center justify-center rounded-md border border-muted text-sm font-medium transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-on-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-accent">
            {n}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
