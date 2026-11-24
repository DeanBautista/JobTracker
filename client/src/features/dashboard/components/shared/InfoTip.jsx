// "?" button with a tooltip on hover and keyboard focus. No JS state needed.
export default function InfoTip({ label, children }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={`Definition of ${label}`}
        className="grid size-5 cursor-help place-items-center rounded-full border border-muted bg-transparent p-0 font-mono text-[11px] leading-none text-muted hover:border-ink hover:text-ink focus-visible:border-ink focus-visible:text-ink"
      >
        ?
      </button>
      <span
        role="tooltip"
        className="absolute top-7 -right-1 z-15 hidden w-55 rounded-md bg-ink px-2.75 py-2.25 text-left font-sans text-[12.5px] leading-[1.45] font-normal tracking-normal text-on-ink normal-case group-focus-within:block group-hover:block"
      >
        {children}
      </span>
    </span>
  );
}
