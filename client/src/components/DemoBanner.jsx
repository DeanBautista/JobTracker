import { useState } from "react";
import Modal from "@/components/Modal";
import { api, getApiError } from "@/lib/api";

export default function DemoBanner() {
  const [open, setOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    if (resetting) return;
    setOpen(false);
    setError("");
  };

  const handleReset = async () => {
    if (resetting) return;
    setResetting(true);
    setError("");
    try {
      await api.post("/demo/reset");
      window.location.reload(); // session restores from the refresh cookie
    } catch (err) {
      setError(getApiError(err).message);
      setResetting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-2 text-[13.5px] shell:px-7">
        <p className="text-muted">
          <span className="font-medium">Demo account</span>
          <span className="hidden sm:inline"> · sample data, feel free to change it</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="link cursor-pointer"
        >
          Reset demo data
        </button>
      </div>

      {open && (
        <Modal labelledBy="reset-demo-title" onClose={close}>
          <div className="px-6 pt-[22px] pb-[22px] max-sm:px-4">
            <h2
              id="reset-demo-title"
              className="font-serif text-2xl leading-tight font-medium tracking-[-0.01em]"
            >
              Reset demo data?
            </h2>
            <p className="mt-2 text-sm text-muted">
              This brings back the original 40 sample jobs. Any jobs you added, edited or
              deleted will be lost.
            </p>
            {error && (
              <p
                role="alert"
                className="mt-4 rounded-md border border-l-[3px] border-danger bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger"
              >
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-rule bg-surface px-6 py-4 max-sm:flex-col-reverse max-sm:items-stretch max-sm:px-4">
            <button
              type="button"
              onClick={close}
              disabled={resetting}
              data-autofocus
              className="btn max-sm:w-full"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className="btn btn-primary max-sm:w-full"
            >
              {resetting ? "Resetting..." : "Reset data"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}