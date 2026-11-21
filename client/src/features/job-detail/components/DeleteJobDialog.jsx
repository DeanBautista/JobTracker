import Modal from "@/components/Modal";

export default function DeleteJobDialog({ open, job, onClose, onConfirm }) {
  if (!open) return null; // Modal opens on mount, so unmount to close

  return (
    <Modal labelledBy="delete-job-title" onClose={onClose}>
      <div className="border-b border-rule px-5 py-4">
        <h2 id="delete-job-title" className="text-base font-semibold">
          Move job to Trash?
        </h2>
      </div>
      <div className="overflow-y-auto px-5 py-4">
        <p className="text-sm text-muted">
          “{job.title}” at {job.company} will be removed from your active jobs. You can restore it from Trash.
        </p>
      </div>
      <div className="flex justify-end gap-2 border-t border-rule px-5 py-3">
        <button type="button" className="btn btn-sm" onClick={onClose} data-autofocus>
          Keep job
        </button>
        <button type="button" className="btn btn-sm btn-danger" onClick={onConfirm}>
          Move to Trash
        </button>
      </div>
    </Modal>
  );
}