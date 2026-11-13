import Modal from "../../../components/Modal";

export default function DeleteJobDialog({ open, job, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} size="sm" title="Move job to Trash?">
      <Modal.Body>
        <p className="text-sm text-muted">
          “{job.title}” at {job.company} will be removed from your active jobs. You can restore it from Trash.
        </p>
      </Modal.Body>
      <Modal.Foot>
        <button type="button" className="btn btn-sm" onClick={onClose}>
          Keep job
        </button>
        <button type="button" className="btn btn-sm btn-danger" onClick={onConfirm}>
          Move to Trash
        </button>
      </Modal.Foot>
    </Modal>
  );
}
