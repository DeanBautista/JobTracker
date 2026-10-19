export default function OrDivider() {
  return (
    <div
      aria-hidden="true"
      className="my-5.5 flex items-center gap-3 font-mono text-xs uppercase leading-none tracking-[0.08em] text-muted"
    >
      <span className="h-px flex-1 bg-rule" />
      or
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}