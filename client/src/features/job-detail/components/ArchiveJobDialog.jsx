import Modal from "@/components/Modal";

export default function ArchiveJobDialog({ open, job, onClose, onConfirm }) {
  if (!open) return null; // Modal opens on mount, so unmount to close

  return (
    <Modal labelledBy="archive-job-title" onClose={onClose}>
      <div className="border-b border-rule px-5 py-4">
        <h2 id="archive-job-title" className="text-base font-semibold">
          Archive this job?
        </h2>
      </div>
      <div className="overflow-y-auto px-5 py-4">
        <p className="text-sm text-muted">
          “{job.title}” at {job.company} will be hidden from your Board and List. It still counts on your dashboard, and you
          can unarchive it any time.
        </p>
      </div>
      <div className="flex justify-end gap-2 border-t border-rule px-5 py-3">
        <button type="button" className="btn btn-sm" onClick={onClose} data-autofocus>
          Keep job
        </button>
        <button type="button" className="btn btn-sm btn-primary" onClick={onConfirm}>
          Archive
        </button>
      </div>
    </Modal>
  );
}