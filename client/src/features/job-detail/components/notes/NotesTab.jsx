import { useMemo, useState } from "react";
import Field from "../../../../components/ui/Field";
import Panel from "../../../../components/ui/Panel";
import SectionHeader from "../../../../components/ui/SectionHeader";
import StateCard from "../../../../components/ui/StateCard";
import NoteCard from "./NoteCard";
import NoteEditDialog from "./NoteEditDialog";

export default function NotesTab({ job, readOnly, actions }) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  // Pinned first, then newest.
  const notes = useMemo(
    () => [...job.notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.createdAt) - new Date(a.createdAt)),
    [job.notes],
  );

  const handleAdd = (e) => {
    e.preventDefault();
    if (!draft.trim()) return setError("Add a note before saving.");
    actions.add(job.id, draft.trim());
    setDraft("");
    setError("");
  };

  return (
    <div className="grid gap-[18px]">
      <SectionHeader
        id="notes-heading"
        title="Notes"
        subtitle="Keep recruiter updates and your own thoughts in one place."
        aside={<span className="label">{notes.length === 1 ? "1 note" : `${notes.length} notes`}</span>}
      />

      {!readOnly && (
        <Panel aria-labelledby="add-note-heading">
          <Panel.Head id="add-note-heading" title="Add a note" description="Notes are private to your job tracker." />
          <Panel.Body>
            <form onSubmit={handleAdd} noValidate className="grid gap-3.5">
              <Field
                as="textarea"
                id="new-note"
                label="Note"
                rows={4}
                maxLength={4000}
                placeholder="What did you learn or what should you remember?"
                help="Up to 4,000 characters."
                error={error}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (error) setError("");
                }}
              />
              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary">
                  Add note
                </button>
              </div>
            </form>
          </Panel.Body>
        </Panel>
      )}

      <SectionHeader level="sub" title="All notes" subtitle="Pinned first, then newest." aside={<span className="text-[12.5px] text-muted">{notes.length} total</span>} />

      {notes.length === 0 ? (
        <StateCard icon="✎" title="No notes yet" message="Add a note after a call, application update, or interview." />
      ) : (
        notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            readOnly={readOnly}
            onTogglePin={() => actions.togglePin(job.id, note.id, !note.pinned)}
            onEdit={() => setEditing(note)}
            onDelete={() => actions.remove(job.id, note.id)}
          />
        ))
      )}

      <NoteEditDialog
        open={Boolean(editing)}
        note={editing}
        onClose={() => setEditing(null)}
        onSubmit={(data) => {
          actions.edit(job.id, editing.id, data);
          setEditing(null);
        }}
      />
    </div>
  );
}
