export default function CountBadge({ children, label }) {
  return (
    <span
      aria-label={label}
      className="inline-grid min-h-[25px] min-w-[25px] place-items-center rounded-full border border-rule px-[7px] py-0.5 font-mono text-[11px] leading-none font-medium text-muted"
    >
      {children}
    </span>
  );
}
