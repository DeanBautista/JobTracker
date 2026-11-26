import Modal from "@/components/Modal";

export default function UnsavedChangesDialog({ open, saving, onStay, onLeave }) {
  if (!open) return null; // Modal opens on mount, so unmount to close

  return (
    <Modal labelledBy="unsaved-changes-title" onClose={onStay}>
      <div className="border-b border-rule px-5 py-4">
        <h2 id="unsaved-changes-title" className="text-base font-semibold">
          Leave without saving?
        </h2>
      </div>
      <div className="overflow-y-auto px-5 py-4">
        <p className="text-sm text-muted">
          {saving
            ? "Your changes are still saving. If you leave now, you may not know whether they were saved."
            : "You have unsaved changes. If you leave now, they will be lost."}
        </p>
      </div>
      <div className="flex justify-end gap-2 border-t border-rule px-5 py-3">
        <button type="button" className="btn btn-sm" onClick={onStay} data-autofocus>
          Stay on page
        </button>
        <button type="button" className="btn btn-sm btn-danger" onClick={onLeave}>
          Leave page
        </button>
      </div>
    </Modal>
  );
}