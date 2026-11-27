import { useState } from "react";
import Panel from "../../../../components/ui/Panel";
import SectionHeader from "../../../../components/ui/SectionHeader";
import StateCard from "../../../../components/ui/StateCard";
import TextBadge from "../../../../components/ui/TextBadge";
import useJobDocuments from "../../hooks/useJobDocuments";
import AddFileDialog from "./AddFileDialog";
import DocumentSlot from "./DocumentSlot";
import FileRow from "./FileRow";
import RemoveFileDialog from "./RemoveFileDialog";

export default function DocumentsTab({ job, readOnly, onCountChange }) {
  const { status, documents, library, retry, upload, attach, update, remove, deleteFile, download, preview } =
    useJobDocuments(job.id, onCountChange);
  const [dialog, setDialog] = useState(null); // null | { usedAs, changing? }
  const [removing, setRemoving] = useState(null); // null | file
  const [busy, setBusy] = useState(false);
  const openAdd = (usedAs = "attachment", changing) => setDialog({ usedAs, changing });

  const resume = documents.find((d) => d.usedAs === "sent-resume");
  const cover = documents.find((d) => d.usedAs === "sent-cover-letter");
  const attachments = documents.filter((d) => d.usedAs === "attachment");

  const rowProps = (file) => ({
    file,
    readOnly,
    onDownload: () => download(file),
    onPreview: () => preview(file),
    onChange: () => openAdd(file.usedAs, file),
    onRemove: () => setRemoving(file),
  });

  // The dialog stays open if the request fails.
  const submit = async (request, close) => {
    setBusy(true);
    const ok = await request();
    setBusy(false);
    if (ok) close();
    return ok;
  };

  if (status === "loading") return <p className="text-sm text-muted">Loading documents…</p>;

  if (status === "error") {
    return (
      <StateCard
        role="alert"
        icon="!"
        title="Could not load documents"
        message="Your documents could not be loaded. Try again."
        action={
          <button type="button" className="btn" onClick={retry}>
            Try again
          </button>
        }
      />
    );
  }

  return (
    <div className="grid gap-[18px]">
      <SectionHeader
        id="documents-heading"
        title="Documents"
        subtitle="Files linked to this job. Sent documents have one slot each."
        aside={
          !readOnly && (
            <button type="button" className="btn btn-primary" onClick={() => openAdd()}>
              ＋ Add file
            </button>
          )
        }
      />

      {documents.length === 0 ? (
        <StateCard
          icon="↥"
          title="No files yet"
          message="Attach the resume, cover letter, or other files you use for this job."
          action={
            !readOnly && (
              <button type="button" className="btn btn-primary" onClick={() => openAdd()}>
                Add file
              </button>
            )
          }
        />
      ) : (
        <>
          <DocumentSlot
            id="resume-group-heading"
            title="Sent resume"
            description={`One slot · the version sent to ${job.company}.`}
            file={resume}
            emptyTitle="No resume attached"
            emptyText="Add the exact resume you sent to the company."
            readOnly={readOnly}
            onAdd={() => openAdd("sent-resume")}
            rowProps={rowProps}
          />
          <DocumentSlot
            id="cover-group-heading"
            title="Sent cover letter"
            description="One slot · optional."
            file={cover}
            emptyTitle="No cover letter attached"
            emptyText="Add the cover letter you sent, if any."
            readOnly={readOnly}
            onAdd={() => openAdd("sent-cover-letter")}
            rowProps={rowProps}
          />
          <Panel aria-labelledby="attachments-heading">
            <Panel.Head
              id="attachments-heading"
              title="Attachments"
              description="Supporting files, portfolios, and certificates."
              aside={<TextBadge>{attachments.length === 1 ? "1 file" : `${attachments.length} files`}</TextBadge>}
            />
            <Panel.Body>
              {attachments.length === 0 ? (
                <p className="text-meta text-muted">No attachments yet.</p>
              ) : (
                <div>
                  {attachments.map((file) => (
                    <FileRow key={file.id} {...rowProps(file)} />
                  ))}
                </div>
              )}
              {!readOnly && (
                <div className="mt-[15px] flex justify-end border-t border-rule pt-3.5">
                  <button type="button" className="btn" onClick={() => openAdd()}>
                    ＋ Add attachment
                  </button>
                </div>
              )}
            </Panel.Body>
          </Panel>
        </>
      )}

      <AddFileDialog
        open={Boolean(dialog)}
        documents={documents}
        library={library}
        initialUsedAs={dialog?.usedAs}
        changing={dialog?.changing}
        busy={busy}
        onClose={() => setDialog(null)}
        onUpload={(data) => submit(() => upload(data), () => setDialog(null))}
        onPickExisting={(data) => submit(() => attach(data), () => setDialog(null))}
        onUpdate={(fileId, data) => submit(() => update(fileId, data), () => setDialog(null))}
        // The dialog stays open so you can keep working after deleting.
        onDeleteExisting={(fileId) => submit(() => deleteFile(fileId), () => {})}
      />
      <RemoveFileDialog
        file={removing}
        busy={busy}
        onClose={() => setRemoving(null)}
        onConfirm={() => submit(() => remove(removing.id), () => setRemoving(null))}
      />
    </div>
  );
}