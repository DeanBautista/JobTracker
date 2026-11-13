import { useState } from "react";
import Field from "../../../../components/ui/Field";
import Modal from "../../../../components/Modal";

function NoteEditForm({ note, onClose, onSubmit }) {
  const [text, setText] = useState(note.text);
  const [pinned, setPinned] = useState(note.pinned);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ text: text.trim(), pinned });
      }}
    >
      <Modal.Body>
        <Field
          as="textarea"
          id="note-edit-text"
          label="Note"
          required
          rows={5}
          maxLength={4000}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <label className="mt-3.5 flex items-center gap-2 text-meta">
          <input type="checkbox" className="accent-accent" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          Pin this note
        </label>
      </Modal.Body>
      <Modal.Foot>
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save note
        </button>
      </Modal.Foot>
    </form>
  );
}

export default function NoteEditDialog({ open, note, onClose, onSubmit }) {
  return (
    <Modal open={open} onClose={onClose} title="Edit note" description="Update your private note.">
      {note && <NoteEditForm note={note} onClose={onClose} onSubmit={onSubmit} />}
    </Modal>
  );
}
