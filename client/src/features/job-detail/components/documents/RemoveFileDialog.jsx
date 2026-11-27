import Modal from "../../../../components/Modal";

export default function RemoveFileDialog({ file, busy, onClose, onConfirm }) {
  return (
    <Modal
      open={Boolean(file)}
      onClose={() => !busy && onClose()}
      title="Remove file"
      description="The file stays in your library, so you can attach it again."
    >
      <Modal.Body>
        <p className="text-sm break-words">
          Remove <strong className="font-semibold">{file?.label || file?.name}</strong> from this job?
        </p>
      </Modal.Body>
      <Modal.Foot>
        <button type="button" className="btn" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Removing…" : "Remove"}
        </button>
      </Modal.Foot>
    </Modal>
  );
}
