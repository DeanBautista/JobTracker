import { useEffect } from "react";

// Calls onDismiss on outside click or Escape while `active` is true.
export default function useDismiss(ref, active, onDismiss) {
  useEffect(() => {
    if (!active) return;

    const handlePointer = (e) => {
      if (!ref.current?.contains(e.target)) onDismiss();
    };
    const handleKey = (e) => {
      if (e.key === "Escape") onDismiss();
    };

    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [ref, active, onDismiss]);
}