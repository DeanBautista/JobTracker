import cx from "../../lib/cx";

// level="section": big serif page-section title. level="sub": small list heading.
export default function SectionHeader({ id, title, subtitle, aside, level = "section" }) {
  const sub = level === "sub";
  return (
    <div className={cx("flex flex-wrap justify-between gap-3.5", sub ? "items-center" : "items-start")}>
      <div className="min-w-0">
        <h2
          id={id}
          className={
            sub
              ? "font-serif text-[1.08rem] leading-tight font-medium"
              : "font-serif text-[clamp(1.45rem,2.5vw,1.8rem)] leading-[1.15] font-normal tracking-[-0.02em]"
          }
        >
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-meta text-muted">{subtitle}</p>}
      </div>
      {aside}
    </div>
  );
}
