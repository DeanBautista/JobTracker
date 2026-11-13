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

function AddFileForm({ job, initialUsedAs, onClose, onUpload, onPickExisting }) {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [type, setType] = useState(TYPE_FOR_USAGE[initialUsedAs] ?? "other");
  const [label, setLabel] = useState("");
  const [usedAs, setUsedAs] = useState(initialUsedAs ?? "attachment");
  const [replace, setReplace] = useState(false);
  const [replaceError, setReplaceError] = useState(false);
  const [existingId, setExistingId] = useState("");

  const slotTaken = usedAs !== "attachment" && job.documents.some((d) => d.usedAs === usedAs);

  const handleFile = (e) => {
    const next = e.target.files?.[0] ?? null;
    setFile(next);
    setFileError(checkFile(next));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || fileError) return setFileError(fileError || "Choose a file to upload.");
    if (slotTaken && !replace) return setReplaceError(true);
    onUpload({ file, type, label: label.trim(), usedAs, replace });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Body>
        <FieldGrid>
          <Field
            id="document-file"
            label="Upload new file"
            full
            type="file"
            required
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            help="PDF, DOC, or DOCX · maximum 5 MB."
            error={fileError}
            onChange={handleFile}
          />
          <Field as="select" id="document-type" label="Type" required options={DOCUMENT_TYPES} value={type} onChange={(e) => setType(e.target.value)} />
          <Field
            id="document-label"
            label="Label"
            required
            maxLength={100}
            placeholder="e.g. Resume v4"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
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

        {job.fileLibrary.length > 0 && (
          <details className="mt-[15px] rounded-lg border border-rule bg-surface px-[15px] py-3">
            <summary className="cursor-pointer text-meta font-medium">Pick an existing file instead</summary>
            <div className="mt-[13px] grid gap-2">
              {job.fileLibrary.map((f) => (
                <label key={f.id} className="flex items-center gap-2 text-meta break-words">
                  <input
                    type="radio"
                    name="existing_file_id"
                    className="accent-accent"
                    checked={existingId === f.id}
                    onChange={() => setExistingId(f.id)}
                  />
                  {f.name} · {f.size} · {f.ext}
                </label>
              ))}
              <button
                type="button"
                className="btn btn-sm justify-self-start"
                disabled={!existingId}
                onClick={() => onPickExisting({ fileId: existingId, usedAs })}
              >
                Pick selected file
              </button>
            </div>
          </details>
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
      </Modal.Body>
      <Modal.Foot>
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Upload file
        </button>
      </Modal.Foot>
    </form>
  );
}

export default function AddFileDialog({ open, job, initialUsedAs, onClose, onUpload, onPickExisting }) {
  return (
    <Modal open={open} onClose={onClose} title="Add file" description="Upload a new file or pick one you already uploaded.">
      <AddFileForm job={job} initialUsedAs={initialUsedAs} onClose={onClose} onUpload={onUpload} onPickExisting={onPickExisting} />
    </Modal>
  );
}
