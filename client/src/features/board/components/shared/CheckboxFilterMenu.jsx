import { useEffect, useId, useRef, useState } from "react";
import { cx } from "../../utils/cx";

/** A button that opens a small checkbox popover. Controlled: value is an array of option values. */
export default function CheckboxFilterMenu({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const popId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    const onKeyDown = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div ref={rootRef} className="relative max-[700px]:flex-1">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "field inline-flex cursor-pointer items-center gap-[9px] max-[700px]:w-full max-[700px]:justify-between",
          open && "border-ink",
        )}
      >
        {label}
        {value.length > 0 && <span className="font-mono text-[11px] text-accent">{value.length}</span>}
        <span
          aria-hidden="true"
          className={cx(
            "mr-0.5 size-[7px] border-b-[1.6px] border-r-[1.6px] border-muted",
            open ? "mt-[3px] -rotate-[135deg]" : "-mt-[3px] rotate-45",
          )}
        />
      </button>

      {open && (
        <div
          id={popId}
          className="absolute top-[46px] left-0 z-[25] min-w-[205px] rounded-lg border border-ink bg-surface px-3.5 py-3 shadow-float max-[700px]:w-full"
        >
          <span className="label mb-2 block">{label}</span>
          {options.map((o) => (
            <label key={o.value} className="flex min-h-10 cursor-pointer items-center gap-[9px] text-sm">
              <input
                type="checkbox"
                checked={value.includes(o.value)}
                onChange={() => toggle(o.value)}
                className="size-4 accent-accent"
              />
              {o.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
