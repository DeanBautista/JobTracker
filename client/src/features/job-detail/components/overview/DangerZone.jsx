import Panel from "../../../../components/ui/Panel";

function Row({ title, text, action }) {
  return (
    <div className="flex flex-col items-start gap-3 border-b border-rule p-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-5">
      <div className="min-w-0">
        <strong className="block text-meta font-semibold">{title}</strong>
        <p className="mt-0.5 max-w-[58ch] text-xs text-muted">{text}</p>
      </div>
      {action}
    </div>
  );
}

export default function DangerZone({ onArchive, onDelete }) {
  return (
    <Panel tone="danger" aria-labelledby="danger-heading" className="mt-5">
      <Panel.Head
        id="danger-heading"
        tone="danger"
        title="Danger zone"
        description="Actions that change where this job appears"
      />
      <Row
        title="Archive this job"
        text="Hide it from your active board and list. You can unarchive it later."
        action={
          <button type="button" className="btn btn-sm shrink-0" onClick={onArchive}>
            Archive job
          </button>
        }
      />
      <Row
        title="Delete this job"
        text="Move this job to Trash. You can restore it before it is permanently removed."
        action={
          <button type="button" className="btn btn-sm btn-danger shrink-0" onClick={onDelete}>
            Delete job
          </button>
        }
      />
    </Panel>
  );
}
