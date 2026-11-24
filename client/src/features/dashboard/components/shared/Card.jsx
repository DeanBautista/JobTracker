import { useId } from "react";

// Titled dashboard panel. `aside` sits on the right of the title (tooltip, label...).
export default function Card({ title, subtitle, aside, className = "", children }) {
  const titleId = useId();

  return (
    <section className={`card ${className}`} aria-labelledby={titleId}>
      <h2
        id={titleId}
        className="flex items-center justify-between gap-2.5 font-serif text-[1.2rem] leading-[1.2] font-medium tracking-[-0.01em]"
      >
        {title}
        {aside}
      </h2>
      {subtitle && <p className="mt-1 mb-4.5 text-[13.5px] text-muted">{subtitle}</p>}
      {children}
    </section>
  );
}
