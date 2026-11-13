import Panel from "../../../../components/ui/Panel";
import TextBadge from "../../../../components/ui/TextBadge";
import { formatDateTime } from "../../utils/formatters";

export default function NoteCard({ note, readOnly, onTogglePin, onEdit, onDelete }) {
  return (
    <Panel as="article" className="p-3.5 sm:px-5 sm:py-[17px]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          {note.pinned && <TextBadge tone="accent">Pinned</TextBadge>}
          <time dateTime={note.createdAt}>{formatDateTime(note.createdAt)}</time>
          {note.edited && (
            <span className="rounded-[4px] border border-rule px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-[0.04em] uppercase">
              Edited
            </span>
          )}
        </div>
        <span className="font-mono text-[11px] font-medium text-muted">#{note.id}</span>
      </div>

      <p className="mt-[13px] max-w-[78ch] break-words whitespace-pre-line">{note.text}</p>

      {!readOnly && (
        <div className="mt-[13px] flex flex-wrap items-center gap-[7px]">
          <button type="button" className="btn btn-sm" onClick={onTogglePin}>
            {note.pinned ? "Unpin" : "Pin"}
          </button>
          <button type="button" className="btn btn-sm" onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="btn btn-sm btn-danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      )}
    </Panel>
  );
}
