import { useEffect, useRef } from "react";

// Native <dialog> opened as a modal. Mount it to open, unmount it to close.
export default function Modal({ labelledBy, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    if (!dialog.open) dialog.showModal();
    dialog.querySelector("[data-autofocus]")?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus?.();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-[660px] max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-[10px] border border-ink bg-surface p-0 text-ink open:flex backdrop:bg-black/45 max-sm:m-0 max-sm:h-dvh max-sm:max-h-none max-sm:w-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0"
    >
      {children}
    </dialog>
  );
}