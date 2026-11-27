import { useState } from "react";
import Field from "../../../../components/ui/Field";
import FieldGrid from "../../../../components/ui/FieldGrid";
import Modal from "../../../../components/Modal";
import {
  ACCEPTED_FILE_EXTENSIONS,
  DOCUMENT_TYPES,
  DOCUMENT_USAGES,
  MAX_FILE_BYTES,
} from "../../utils/detailOptions";

const TYPE_FOR_USAGE = { "sent-resume": "resume", "sent-cover-letter": "cover-letter", attachment: "other" };

function checkFile(file) {
  if (!file) return "";
  const ext = file.name.split(".").pop().toLowerCase();
  if (!ACCEPTED_FILE_EXTENSIONS.includes(ext)) return "Wrong file type. Upload a PDF, DOC, or DOCX file.";
  if (file.size > MAX_FILE_BYTES) return "File is too large. Choose a file under 5 MB.";
  return "";
}

function AddFileForm({
  documents,
  library,
  initialUsedAs,
  changing,
  busy,
  onClose,
  onUpload,
  onPickExisting,
  onUpdate,
  onDeleteExisting,
}) {
  // "Change" starts with the file's current values. "Add" starts empty.
  const initial = {
    type: changing?.type ?? TYPE_FOR_USAGE[initialUsedAs] ?? "other",
    label: changing?.label ?? "",
  };
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [type, setType] = useState(initial.type);
  const [label, setLabel] = useState(initial.label);
  const [labelError, setLabelError] = useState("");
  const [usedAs, setUsedAs] = useState(changing?.usedAs ?? initialUsedAs ?? "attachment");
  const [replace, setReplace] = useState(false);
  const [replaceError, setReplaceError] = useState(false);
  const [existingId, setExistingId] = useState("");
  const [confirmId, setConfirmId] = useState(""); // file waiting for delete confirmation

  const picked = library.find((f) => f.id === existingId);
  // The file whose details are being edited, if it is already saved.
  const saved = picked ?? (file ? null : changing);
  const slotTaken =
    usedAs !== "attachment" && documents.some((d) => d.usedAs === usedAs && d.id !== changing?.id);

  // Files this save would take off the job for the last time. They get erased for good.
  const leaving = [
    ...(changing && (file || picked) ? [changing] : []),
    ...(slotTaken ? documents.filter((d) => d.usedAs === usedAs && d.id !== changing?.id) : []),
  ].filter((d) => d.removed && d.usedBy === 0);

  const fillDetails = (values) => {
    setType(values.type);
    setLabel(values.label);
    setLabelError("");
  };

  const handlePickChange = (next) => {
    setExistingId(next.id);
    setFile(null);
    setFileError("");
    fillDetails(next);
  };

  const clearPick = () => {
    setExistingId("");
    fillDetails(initial);
  };

  const handleFile = (e) => {
    const next = e.target.files?.[0] ?? null;
    setFile(next);
    setFileError(checkFile(next));
  };

  const handleDelete = async (fileId) => {
    const ok = await onDeleteExisting(fileId);
    if (ok && fileId === existingId) clearPick();
    setConfirmId("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (busy) return;
    if (!picked) {
      if (fileError) return;
      if (!file && !changing) return setFileError("Choose a file to upload, or pick an existing one.");
    }
    if (!label.trim()) return setLabelError("Enter a label.");
    if (slotTaken && !replace) return setReplaceError(true);

    const details = { type, label: label.trim(), usedAs, replace: slotTaken && replace };
    if (picked) return onPickExisting({ ...details, fileId: picked.id, replaceFileId: changing?.id });
    if (file) return onUpload({ ...details, file, replaceFileId: changing?.id });

    // Change without a new file: save the details only.
    const unchanged =
      details.type === changing.type && details.label === changing.label && usedAs === changing.usedAs;
    if (unchanged) return onClose();
    onUpdate(changing.id, details);
  };

  let submitText = "Upload file";
  if (picked) submitText = "Attach file";
  else if (changing && !file) submitText = "Save changes";

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Body>
        {picked ? (
          <div className="mb-[15px] flex flex-wrap items-center justify-between gap-2 rounded-md bg-tint px-3 py-2.5 text-xs">
            <p className="min-w-0 break-words">
              Using your existing file <strong className="font-semibold">{picked.name}</strong>.
            </p>
            <button type="button" className="btn btn-sm" onClick={clearPick} disabled={busy}>
              Upload a new file instead
            </button>
          </div>
        ) : (
          <FieldGrid>
            <Field
              id="document-file"
              label={changing ? "Upload a replacement file (optional)" : "Upload new file"}
              full
              type="file"
              required={!changing}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              help={
                changing
                  ? "Leave empty to keep the current file. PDF, DOC, or DOCX · maximum 5 MB."
                  : "PDF, DOC, or DOCX · maximum 5 MB."
              }
              error={fileError}
              onChange={handleFile}
            />
          </FieldGrid>
        )}

        {library.length > 0 && (
          <details className="my-[15px] rounded-lg border border-rule bg-surface px-[15px] py-3">
            <summary className="cursor-pointer text-meta font-medium">Pick an existing file instead</summary>
            <div className="mt-[13px] grid gap-2">
              {library.map((f) => (
                <div key={f.id} className="border-b border-rule pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <label className="flex min-w-0 items-center gap-2 text-meta break-words">
                      <input
                        type="radio"
                        name="existing_file_id"
                        className="accent-accent"
                        checked={existingId === f.id}
                        onChange={() => handlePickChange(f)}
                      />
                      <span className="min-w-0">
                        {f.label ? `${f.label} (${f.name})` : f.name} · {f.size} · {f.ext}
                      </span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger shrink-0"
                      aria-label={`Remove ${f.label || f.name} from library`}
                      disabled={busy}
                      onClick={() => setConfirmId(f.id)}
                    >
                      Remove
                    </button>
                  </div>

                  {f.usedBy > 0 && (
                    <p className="mt-1 text-xs text-muted">
                      Used by {f.usedBy === 1 ? "1 other job" : `${f.usedBy} other jobs`}.
                    </p>
                  )}

                  {confirmId === f.id && (
                    <div role="alert" className="mt-2 rounded-md bg-tint px-3 py-2.5 text-xs">
                      <p>
                        {f.usedBy > 0
                          ? `${f.usedBy === 1 ? "The job" : `The ${f.usedBy} jobs`} using this file will keep it, but you won’t be able to attach it to other jobs. When no job uses it anymore, it is permanently deleted. This can’t be undone.`
                          : "No job uses this file, so it will be permanently deleted. This can’t be undone."}
                      </p>
                      <div className="mt-2 flex gap-1.5">
                        <button type="button" className="btn btn-sm" disabled={busy} onClick={() => setConfirmId("")}>
                          Keep file
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          disabled={busy}
                          onClick={() => handleDelete(f.id)}
                        >
                          {busy ? "Removing…" : f.usedBy > 0 ? "Remove from library" : "Delete permanently"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}

        <FieldGrid>
          <Field as="select" id="document-type" label="Type" required options={DOCUMENT_TYPES} value={type} onChange={(e) => setType(e.target.value)} />
          <Field
            id="document-label"
            label="Label"
            required
            maxLength={80}
            placeholder="e.g. Resume v4"
            value={label}
            error={labelError}
            onChange={(e) => {
              setLabel(e.target.value);
              setLabelError("");
            }}
          />
          <Field
            as="select"
            id="document-used-as"
            label="Used as"
            full
            required
            options={DOCUMENT_USAGES}
            help="Each sent resume and sent cover letter has one slot. If a slot is full, choose whether to replace the current file."
            value={usedAs}
            onChange={(e) => {
              setUsedAs(e.target.value);
              setReplace(false);
              setReplaceError(false);
            }}
          />
        </FieldGrid>

        {saved?.usedBy > 0 && (
          <p className="mt-[13px] text-xs text-muted">
            Type and label are shared. Changes also apply to {saved.usedBy === 1 ? "1 other job" : `${saved.usedBy} other jobs`} using
            this file. “Used as” applies to this job only.
          </p>
        )}

        {slotTaken && (
          <div className="mt-[13px] rounded-md bg-tint px-3 py-2.5 text-xs">
            <p>
              <strong className="font-semibold">This job already has a {usedAs === "sent-resume" ? "sent resume" : "sent cover letter"}.</strong>{" "}
              Confirm replacement before replacing the current file.
            </p>
            <label className="mt-3 flex items-center gap-2 text-meta">
              <input type="checkbox" className="accent-accent" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
              Replace the current file in that slot
            </label>
            {replaceError && !replace && <p className="mt-2 text-danger">Tick the box to replace the current file.</p>}
          </div>
        )}

        {leaving.length > 0 && (
          <p role="alert" className="mt-[13px] text-xs text-danger">
            Saving will permanently delete {leaving.map((d) => `“${d.label || d.name}”`).join(" and ")}. It isn’t in your
            library and no other job uses it.
          </p>
        )}
      </Modal.Body>
      <Modal.Foot>
        <button type="button" className="btn" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy && !confirmId ? "Saving…" : submitText}
        </button>
      </Modal.Foot>
    </form>
  );
}

export default function AddFileDialog({ open, onClose, changing, ...formProps }) {
  return (
    <Modal
      open={open}
      // Stays open while a request is running.
      onClose={() => !formProps.busy && onClose()}
      title={changing ? "Change file" : "Add file"}
      description={
        changing
          ? `Edit “${changing.label || changing.name}”.${
              changing.removed ? "" : " If you swap in another file, the old one stays in your library."
            }`
          : "Upload a new file or pick one you already uploaded."
      }
    >
      <AddFileForm {...formProps} changing={changing} onClose={onClose} />
    </Modal>
  );
}