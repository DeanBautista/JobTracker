import cx from "../../../../lib/cx";
import { formatDate } from "../../utils/formatters";

export default function FileRow({ file, readOnly, onChange, onRemove }) {
  const isPdf = file.ext === "PDF";
  return (
    <article className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 border-b border-rule py-3.5 first:pt-0 last:border-b-0 last:pb-0">
      <div
        aria-hidden="true"
        className={cx(
          "grid h-11 w-10 place-items-center rounded-[5px] border font-mono text-[10px] font-medium",
          isPdf ? "border-danger bg-danger-soft text-danger" : "border-accent bg-accent-soft text-accent",
        )}
      >
        {isPdf ? "PDF" : "DOC"}
      </div>

      <div className="min-w-0">
        <strong className="block text-sm font-semibold break-words">{file.name}</strong>
        <p className="mt-[3px] text-xs text-muted">
          {file.kind} · {file.ext} · {file.size}
        </p>
        <small className="mt-[3px] block text-xs text-muted">Added {formatDate(file.addedAt)}</small>
      </div>

      <div className="col-start-2 flex flex-wrap items-center gap-1.5">
        <a className="btn btn-sm" href={file.url} download>
          Download
        </a>
        {isPdf && (
          <a className="btn btn-sm" href={file.url} target="_blank" rel="noopener noreferrer">
            Preview PDF
          </a>
        )}
        {!readOnly && (
          <>
            <button type="button" className="btn btn-sm" onClick={onChange}>
              Change
            </button>
            <button type="button" className="btn btn-sm btn-danger" onClick={onRemove}>
              Remove
            </button>
          </>
        )}
      </div>
    </article>
  );
}
