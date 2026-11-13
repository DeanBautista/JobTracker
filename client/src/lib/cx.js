// Joins class names, skipping falsy values. Never pass two conflicting
// utilities (e.g. "p-2" and "p-4"): Tailwind picks by stylesheet order, not
// by class order. Use a map of variants instead.
export default function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}
