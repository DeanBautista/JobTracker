export const sectionTitleClass =
  "font-serif text-[length:clamp(1.9rem,3.6vw,2.8rem)] leading-[1.1] font-normal tracking-[-0.02em] text-balance";

export default function SectionIntro({ id, label, title, description }) {
  return (
    <header className="mb-[clamp(32px,5vw,56px)] max-w-[640px]">
      <span className="label">{label}</span>
      <h2 id={id} className={`mt-3.5 ${sectionTitleClass}`}>
        {title}
      </h2>
      {description && <p className="mt-3.5 text-[17px] text-muted">{description}</p>}
    </header>
  );
}
