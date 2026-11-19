import { useEffect } from "react";
import { STAGE_LABELS } from "../../utils/boardStages";

const DISMISS_MS = 8000;

// The live region is always mounted so screen readers announce the message when it appears.
export default function BoardToast({ move, error, onUndo, onDismiss }) {
  const active = move || error;

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDismiss, DISMISS_MS);
    return () => clearTimeout(t);
  }, [active, onDismiss]);

  return (
    <div role="status" aria-live="polite">
      {active && (
        <div className="fixed right-3 bottom-[68px] left-3 z-50 flex flex-wrap items-center justify-between gap-3.5 rounded-lg border border-ink bg-surface px-3.5 py-3 text-sm shadow-[0_12px_30px_rgb(0_0_0/0.16)] sm:right-6 sm:bottom-6 sm:left-auto sm:max-w-[calc(100vw-32px)] sm:justify-start">
          <span>{move ? `Moved ${move.title} to ${STAGE_LABELS[move.to]}.` : error}</span>
          {move && (
            <button
              type="button"
              onClick={onUndo}
              className="min-h-9 cursor-pointer rounded-md border border-rule bg-tint px-2.5 font-medium"
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
