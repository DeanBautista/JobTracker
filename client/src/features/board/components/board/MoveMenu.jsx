import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ALL_STAGES } from "../../utils/boardStages";

const WIDTH = 205;

// Stops dnd-kit's card-level listeners from treating a press on the menu as a drag.
const stop = (e) => e.stopPropagation();

const item =
  "block w-full cursor-pointer rounded-sm border-0 bg-transparent px-2.5 py-[9px] text-left text-sm hover:bg-tint";

/**
 * The keyboard / touch / screen-reader alternative to dragging.
 * The popover is portalled to <body> and positioned with `fixed`, so the board's
 * scrolling container can never clip it (even for the last card in a column).
 */
export default function MoveMenu({ job, onMove, onArchive, onDelete }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const triggerRef = useRef(null);
  const popRef = useRef(null);
  const popId = useId();
  const title = `${job.title} at ${job.company}`;

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    const height = popRef.current?.offsetHeight ?? 0;
    const left = Math.max(8, Math.min(rect.right - WIDTH, window.innerWidth - WIDTH - 8));
    const below = rect.bottom + 4;
    const top = below + height > window.innerHeight - 8 ? Math.max(8, rect.top - 4 - height) : below;
    setPos({ left, top });
  }, [open]);

  // Focus the first option once the popover is placed (hidden elements can't take focus).
  const placed = pos !== null;
  useEffect(() => {
    if (open && placed) popRef.current?.querySelector("button:not(:disabled)")?.focus();
  }, [open, placed]);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!popRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) close();
    };
    const onKeyDown = (e) => e.key === "Escape" && close(true);
    const onScroll = (e) => !popRef.current?.contains(e.target) && close();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Move ${title} to another stage`}
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        title="Move to stage"
        onPointerDown={stop}
        onTouchStart={stop}
        onClick={() => setOpen((v) => !v)}
        className="absolute top-[7px] right-[7px] z-[5] grid size-10 cursor-pointer place-items-center rounded-md border border-transparent bg-transparent text-base leading-none font-semibold tracking-[1px] text-muted hover:border-rule hover:bg-paper hover:text-ink aria-expanded:border-rule aria-expanded:bg-paper aria-expanded:text-ink"
      >
        <span aria-hidden="true">···</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={popRef}
            id={popId}
            role="group"
            aria-label={`Move ${title} to`}
            onPointerDown={stop}
            onTouchStart={stop}
            style={pos ?? { left: 0, top: 0, visibility: "hidden" }}
            className="fixed z-40 w-[205px] rounded-lg border border-ink bg-surface p-2.5 shadow-float"
          >
            <span className="label mx-2 mt-px mb-[7px] block">Move to</span>
            <div className="grid grid-cols-2 gap-[3px]">
              {ALL_STAGES.map((stage) => {
                const current = stage.value === job.stage;
                return (
                  <button
                    key={stage.value}
                    type="button"
                    disabled={current}
                    aria-current={current ? "true" : undefined}
                    onClick={() => {
                      onMove(job.id, stage.value);
                      close();
                    }}
                    className="block min-h-10 w-full cursor-pointer rounded-sm px-[7px] py-[5px] text-left text-[12.5px] hover:bg-tint disabled:cursor-default disabled:bg-transparent disabled:font-medium disabled:text-accent"
                  >
                    {current ? "✓ " : ""}
                    {stage.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 border-t border-rule pt-1">
              <button
                type="button"
                onClick={() => {
                  close();
                  onArchive?.([job.id]);
                }}
                className={item}
              >
                Archive
              </button>
              <button
                type="button"
                onClick={() => {
                  close();
                  if (window.confirm(`Delete ${job.title}? This can't be undone.`)) onDelete?.([job.id]);
                }}
                className={`${item} text-danger`}
              >
                Delete
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
