import { useEffect, useRef, useState } from "react";
import useBootDone from "@/hooks/useBootDone";

export default function useCountUp(target, { duration = 500, from, decimals = 0 } = {}) {
  const [value, setValue] = useState(from ?? 0);
  const last = useRef(from ?? 0);
  const reduce =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const valid = Number.isFinite(target);
  const ready = useBootDone();

  useEffect(() => {
    if (reduce || !valid || !ready) return;
    const start = performance.now();
    const origin = from ?? last.current;
    const f = 10 ** decimals;
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const next = Math.round((origin + (target - origin) * (1 - (1 - t) ** 3)) * f) / f;
      last.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, from, decimals, reduce, valid, ready]);

  return reduce || !valid ? target : value;
}