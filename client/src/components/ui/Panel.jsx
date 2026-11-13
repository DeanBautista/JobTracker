import cx from "../../lib/cx";

const TONES = { default: "border-rule", danger: "border-danger/50" };

// Bordered card. No `overflow-hidden` on purpose: it clipped dropdown menus and
// focus rings. Children never need clipping because nothing inside paints a
// background that reaches the rounded corners.
export default function Panel({ as: Tag = "section", tone = "default", className, children, ...rest }) {
  return (
    <Tag className={cx("min-w-0 rounded-lg border bg-surface", TONES[tone], className)} {...rest}>
      {children}
    </Tag>
  );
}

function Head({ id, title, description, aside, tone = "default" }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-rule px-3.5 pb-3 pt-4 sm:px-5 sm:pb-3.5">
      <div className="min-w-0">
        <h2
          id={id}
          className={cx(
            "font-serif text-xl leading-[1.15] font-medium tracking-[-0.01em]",
            tone === "danger" ? "text-danger" : "text-ink",
          )}
        >
          {title}
        </h2>
        {description && <p className="mt-1 text-meta text-muted">{description}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}

function Body({ className, children }) {
  return <div className={cx("px-3.5 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-[18px]", className)}>{children}</div>;
}

Panel.Head = Head;
Panel.Body = Body;
