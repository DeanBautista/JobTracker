import { useMemo, useState } from "react";
import cx from "@/lib/cx";
import useIntro from "@/hooks/useIntro";
import Field from "../../../../components/ui/Field";
import Panel from "../../../../components/ui/Panel";
import SectionHeader from "../../../../components/ui/SectionHeader";
import StateCard from "../../../../components/ui/StateCard";
import useJobNotes from "../../hooks/useJobNotes";
import NoteCard from "./NoteCard";
import NoteEditDialog from "./NoteEditDialog";

export default function NotesTab({ job, readOnly, onCountChange }) {
  const { status, notes: loaded, retry, add, edit, togglePin, remove } = useJobNotes(job.id, onCountChange);
  const intro = useIntro(status === "success");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  // Pinned first, then newest.
  const notes = useMemo(
    () => [...loaded].sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.createdAt) - new Date(a.createdAt)),
    [loaded],
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return setError("Add a note before saving.");
    setSaving(true);
    const ok = await add(text);
    setSaving(false);
    if (ok) {
      setDraft("");
      setError("");
    }
  };

  // Only send what changed, so pinning from the dialog doesn't mark the note as edited.
  const handleEdit = async (data) => {
    const patch = {};
    if (data.text !== editing.text) patch.text = data.text;
    if (data.pinned !== editing.pinned) patch.pinned = data.pinned;
    if (Object.keys(patch).length === 0 || (await edit(editing.id, patch))) setEditing(null);
  };

  return (
    <div className="grid gap-[18px]">
      <SectionHeader
        id="notes-heading"
        title="Notes"
        subtitle="Keep recruiter updates and your own thoughts in one place."
        aside={status === "success" ? <span className="label">{notes.length === 1 ? "1 note" : `${notes.length} notes`}</span> : null}
      />

      {!readOnly && (
        <Panel
          aria-labelledby="add-note-heading"
          className={cx(intro && "animate-rise")}
        >
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
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Adding…" : "Add note"}
                </button>
              </div>
            </form>
          </Panel.Body>
        </Panel>
      )}

      <SectionHeader
        level="sub"
        title="All notes"
        subtitle="Pinned first, then newest."
        aside={status === "success" ? <span className="text-[12.5px] text-muted">{notes.length} total</span> : null}
      />

      {status === "loading" && <p className="text-sm text-muted">Loading notes…</p>}

      {status === "error" && (
        <StateCard
          role="alert"
          icon="!"
          title="Could not load notes"
          message="Your notes could not be loaded. Try again."
          action={
            <button type="button" className="btn" onClick={retry}>
              Try again
            </button>
          }
        />
      )}

      {status === "success" &&
        (notes.length === 0 ? (
          <StateCard icon="✎" title="No notes yet" message="Add a note after a call, application update, or interview." />
        ) : (
          notes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              index={index}
              intro={intro}
              readOnly={readOnly}
              onTogglePin={() => togglePin(note.id, !note.pinned)}
              onEdit={() => setEditing(note)}
              onDelete={() => remove(note.id)}
            />
          ))
        ))}

      <NoteEditDialog open={Boolean(editing)} note={editing} onClose={() => setEditing(null)} onSubmit={handleEdit} />
    </div>
  );
}