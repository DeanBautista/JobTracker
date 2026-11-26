import { useCallback, useMemo, useRef, useState } from "react";
import ToastContext from "./ToastContext";

const DISMISS_MS = 8000;

// One toast at a time: a new one replaces the old one, so an Undo never goes stale.
// The live region is always mounted so screen readers announce the message when it appears.
export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToast((current) => (current?.id === id ? null : current));
  }, []);

  const show = useCallback(
    (message, { action, duration = DISMISS_MS } = {}) => {
      const id = nextId.current++;
      setToast({ id, message, action });
      setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className="animate-pop fixed right-3 bottom-[68px] left-3 z-[60] flex flex-wrap items-center justify-between gap-3.5 rounded-lg border border-ink bg-surface px-3.5 py-3 text-sm shadow-[0_12px_30px_rgb(0_0_0/0.16)] sm:right-6 sm:bottom-6 sm:left-auto sm:max-w-[calc(100vw-32px)] sm:justify-start">
            <span>{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action.onClick();
                  dismiss(toast.id);
                }}
                className="min-h-9 cursor-pointer rounded-md border border-rule bg-tint px-2.5 font-medium"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}