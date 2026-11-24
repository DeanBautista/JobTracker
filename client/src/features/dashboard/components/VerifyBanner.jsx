import { useState } from "react";

export default function VerifyBanner({ onResend }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-md border border-l-[3px] border-rule border-l-accent bg-surface px-4 py-3 text-sm"
    >
      <span>
        Verify your email to get reminder emails. The app works without it, but reminder and
        digest emails are skipped.
      </span>
      <span className="flex items-center gap-2.5">
        <button type="button" className="btn btn-sm" onClick={onResend}>
          Resend link
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setDismissed(true)}>
          Dismiss
        </button>
      </span>
    </div>
  );
}
