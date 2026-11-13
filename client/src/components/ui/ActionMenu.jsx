import { useEffect, useRef, useState } from "react";
import cx from "../../lib/cx";

/**
 * "···" button with a dropdown. Closes on item click, outside press and Esc.
 * (Swap the effect for your lib/useDismiss if you prefer.)
 *
 *   <ActionMenu label="Reminder actions">
 *     <ActionMenu.Item onClick={...}>Edit</ActionMenu.Item>
 *     <ActionMenu.Item danger onClick={...}>Delete</ActionMenu.Item>
 *   </ActionMenu>
 */
export default function ActionMenu({ label = "More actions", children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPress = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPress);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPress);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid size-10 cursor-pointer place-items-center rounded-md border border-transparent font-semibold tracking-[1px] text-muted hover:border-rule hover:bg-paper hover:text-ink aria-expanded:border-rule aria-expanded:bg-paper aria-expanded:text-ink"
      >
        ···
      </button>
      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className="absolute top-10 right-0 z-10 w-44 rounded-lg border border-ink bg-surface p-1.5 shadow-float"
        >
          {children}
        </div>
      )}
    </div>
  );
}

ActionMenu.Item = function ActionMenuItem({ danger, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cx(
        "block w-full cursor-pointer rounded px-2.5 py-2 text-left text-meta hover:bg-tint",
        danger && "text-danger",
      )}
      {...props}
    />
  );
};
