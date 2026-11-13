import cx from "../../../lib/cx";

const COPY = { saved: "Saved", saving: "Saving…", error: "Could not save" };
const DOT = { saved: "bg-accent", saving: "bg-muted", error: "bg-danger" };

// Always renders its row (even when empty) so the layout below never jumps.
export default function SaveStatus({ status, hidden, onRetry }) {
  return (
    <div aria-live="polite" className="mt-2.5 mb-0.5 flex min-h-8 items-center gap-2 text-meta text-muted">
      {!hidden && (
        <>
          <span className="inline-flex items-center gap-[7px]">
            <span aria-hidden="true" className={cx("size-[7px] rounded-full", DOT[status])} />
            {COPY[status]}
          </span>
          {status === "error" && (
            <button type="button" onClick={onRetry} className="link cursor-pointer text-danger">
              Retry
            </button>
          )}
        </>
      )}
    </div>
  );
}
