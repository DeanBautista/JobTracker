import { useEffect, useRef } from "react";

// Modal confirmation on the native <dialog>.
// Esc calls onCancel, so `open` stays the single source of truth.
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  const confirmStyles = destructive
    ? "border-danger bg-danger text-paper hover:bg-danger hover:brightness-110"
    : "bg-ink text-on-ink hover:border-accent hover:bg-accent hover:text-on-ink";

  return (
    <dialog
      ref={ref}
      role="alertdialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(92vw,420px)] rounded-[10px] border border-ink bg-surface p-6 text-ink backdrop:bg-black/45"
    >
      <h2 id="confirm-title" className="mb-1.5 font-serif text-[1.35rem] leading-[1.2] font-medium tracking-[-0.01em]">
        {title}
      </h2>
      <p id="confirm-message" className="mb-5.5 text-muted">{children}</p>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn">{cancelLabel}</button>
        <button type="button" onClick={onConfirm} className={`btn ${confirmStyles}`}>{confirmLabel}</button>
      </div>
    </dialog>
  );
}