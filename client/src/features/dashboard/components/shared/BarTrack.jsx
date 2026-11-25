// Horizontal bar: grey track with an accent fill. `percent` is 0-100.
export default function BarTrack({ percent, className = "h-5.5", fillClassName = "", delay = 0 }) {
  return (
    <span className={`block overflow-hidden rounded-[3px] bg-tint ${className}`}>
      <span
        className={`block h-full origin-left animate-grow rounded-[3px] bg-accent ${fillClassName}`}
        style={{ width: `${percent}%`, animationDelay: `${delay}ms` }}
      />
    </span>
  );
}
