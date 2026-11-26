import { useEffect, useId, useRef } from "react";

function Body({ children, className = "" }) {
  return <div className={`min-h-0 overflow-y-auto px-5 py-4 ${className}`}>{children}</div>;
}

function Foot({ children }) {
  return <div className="flex justify-end gap-2 border-t border-rule px-5 py-3">{children}</div>;
}

function Dialog({ labelledBy, title, description, size, onClose, children }) {
  const ref = useRef(null);
  const autoId = useId();
  const titleId = title ? autoId : labelledBy;

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

  const width = size === "sm" ? "max-w-[440px]" : "max-w-[660px]";

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className={`m-auto w-[calc(100%-2rem)] ${width} max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden open:animate-pop rounded-[10px] border border-ink bg-surface p-0 text-ink open:flex backdrop:bg-black/45 max-sm:m-0 max-sm:h-dvh max-sm:max-h-none max-sm:w-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0`}
    >
      {title && (
        <div className="border-b border-rule px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
      )}
      {children}
    </dialog>
  );
}

// `open` is optional: omit it to open on mount (old behavior), or pass it to show/hide.
export default function Modal({ open, ...props }) {
  if (open === false) return null;
  return <Dialog {...props} />;
}

Modal.Body = Body;
Modal.Foot = Foot;