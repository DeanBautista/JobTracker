import { useState } from "react";
import Panel from "../../../../components/ui/Panel";
import SectionHeader from "../../../../components/ui/SectionHeader";
import StateCard from "../../../../components/ui/StateCard";
import TextBadge from "../../../../components/ui/TextBadge";
import AddFileDialog from "./AddFileDialog";
import DocumentSlot from "./DocumentSlot";
import FileRow from "./FileRow";

export default function DocumentsTab({ job, readOnly, actions }) {
  const [dialog, setDialog] = useState(null); // null | { usedAs }
  const openAdd = (usedAs = "attachment") => setDialog({ usedAs });

  const resume = job.documents.find((d) => d.usedAs === "sent-resume");
  const cover = job.documents.find((d) => d.usedAs === "sent-cover-letter");
  const attachments = job.documents.filter((d) => d.usedAs === "attachment");

  const rowProps = (file) => ({
    file,
    readOnly,
    onChange: () => openAdd(file.usedAs),
    onRemove: () => actions.remove(job.id, file.id),
  });

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

      {job.documents.length === 0 ? (
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
        job={job}
        initialUsedAs={dialog?.usedAs}
        onClose={() => setDialog(null)}
        onUpload={(data) => {
          actions.upload(job.id, data);
          setDialog(null);
        }}
        onPickExisting={(data) => {
          actions.pickExisting(job.id, data);
          setDialog(null);
        }}
      />
    </div>
  );
}
