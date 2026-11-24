// Horizontal bar: grey track with an accent fill. `percent` is 0-100.
export default function BarTrack({ percent, className = "h-5.5", fillClassName = "" }) {
  return (
    <span className={`block overflow-hidden rounded-[3px] bg-tint ${className}`}>
      <span
        className={`block h-full rounded-[3px] bg-accent ${fillClassName}`}
        style={{ width: `${percent}%` }}
      />
    </span>
  );
}
