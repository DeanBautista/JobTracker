const variantStyles = {
  ok: "border-accent bg-accent-soft",
  error: "border-danger bg-danger-soft",
  info: "border-info bg-info-soft",
};

// Banner with an icon, a bold title and optional extra content.
// Use role="alert" for errors so screen readers announce them right away.
export default function StatusMessage({
  variant = "info",
  icon,
  title,
  role = "status",
  children,
}) {
  return (
    <div
      role={role}
      className={`mt-5.5 flex items-start gap-3 rounded-md border border-l-[3px] px-3.5 py-3 text-[14.5px] leading-normal ${variantStyles[variant]}`}
    >
      <span className="mt-0.5 size-[18px] flex-none">{icon}</span>
      <div className="min-w-0">
        <strong className="block font-semibold">{title}</strong>
        {children}
      </div>
    </div>
  );
}