import Panel from "../../../../components/ui/Panel";
import TextBadge from "../../../../components/ui/TextBadge";
import FileRow from "./FileRow";

// A "one file only" slot (sent resume, sent cover letter): file row, or a dashed empty box.
export default function DocumentSlot({ id, title, description, file, emptyTitle, emptyText, readOnly, onAdd, rowProps }) {
  return (
    <Panel aria-labelledby={id}>
      <Panel.Head id={id} title={title} description={description} aside={<TextBadge>1 slot</TextBadge>} />
      <Panel.Body>
        {file ? (
          <FileRow {...rowProps(file)} />
        ) : (
          <div className="flex flex-col items-start gap-4 rounded-[7px] border border-dashed border-muted p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <strong className="text-sm">{emptyTitle}</strong>
              <p className="mt-[3px] text-xs text-muted">{emptyText}</p>
            </div>
            {!readOnly && (
              <button type="button" className="btn btn-sm shrink-0" onClick={onAdd}>
                ＋ Add file
              </button>
            )}
          </div>
        )}
      </Panel.Body>
    </Panel>
  );
}
