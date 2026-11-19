import { useEffect, useRef } from "react";
import { OPEN_STAGES } from "../../utils/boardStages";

// Phones only: chips that scroll the board sideways to a column.
export default function StageJumpNav({ groups, closedTotal }) {
  const navRef = useRef(null);
  const drag = useRef({ down: false, moved: false, startX: 0, startLeft: 0 });

  // Vertical wheel -> horizontal scroll (needs a non-passive listener to preventDefault).
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e) => {
    if (e.pointerType !== "mouse") return; // touch already scrolls natively
    drag.current = { down: true, moved: false, startX: e.clientX, startLeft: navRef.current.scrollLeft };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 5) d.moved = true;
    if (d.moved) navRef.current.scrollLeft = d.startLeft - dx;
  };
  const endDrag = () => {
    drag.current.down = false;
  };

  const jump = (id) => {
    const col = document.getElementById(id);
    const board = col?.closest('[role="region"]'); // the board's horizontal scroller
    if (!col || !board) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left = board.scrollLeft + col.getBoundingClientRect().left - board.getBoundingClientRect().left;

    board.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  };

  const items = [
    ...OPEN_STAGES.map((s) => ({ id: `column-${s.value}`, label: s.label, count: groups[s.value].length })),
    { id: "column-closed", label: "Closed", count: closedTotal },
  ];

  return (
    <nav
      ref={navRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      aria-label="Jump to stage"
      className="mb-1.5 hidden snap-x gap-1.5 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] max-sm:flex [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)]"
    >
      {items.map((i) => (
        <button
          key={i.id}
          type="button"
          onClick={() => {
            // A mouse drag ends with a click on the pill under the cursor; ignore that one.
            if (drag.current.moved) {
              drag.current.moved = false;
              return;
            }
            jump(i.id);
          }}
          className="inline-flex min-h-10 flex-none cursor-pointer snap-start items-center justify-center gap-1.5 rounded-full border border-rule bg-surface px-3 text-[13px] whitespace-nowrap"
        >
          {i.label} <span className="font-mono text-[10px] leading-none text-muted">{i.count}</span>
        </button>
      ))}
    </nav>
  );
}