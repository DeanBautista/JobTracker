import { Link, useParams } from "react-router-dom";
import StateCard from "../../../components/ui/StateCard";
import JobDetailSkeleton from "../components/JobDetailSkeleton";
import JobDetailView from "../components/JobDetailView";
import useJobDetail from "../hooks/useJobDetail";

// Placeholders until the API exists. Every action takes the job id first.
const actions = {
  job: {
    archive: (id) => console.info("archive", id),
    unarchive: (id) => console.info("unarchive", id),
    restore: (id) => console.info("restore", id),
    remove: (id) => console.info("move to trash", id),
    reopen: (id) => console.info("reopen", id),
    editClosure: (id, closure) => console.info("edit closure", id, closure),
  },
  notes: {
    add: (id, text) => console.info("add note", id, text),
    edit: (id, noteId, data) => console.info("edit note", id, noteId, data),
    togglePin: (id, noteId, pinned) => console.info("pin note", id, noteId, pinned),
    remove: (id, noteId) => console.info("delete note", id, noteId),
  },
  documents: {
    upload: (id, data) => console.info("upload", id, data),
    pickExisting: (id, data) => console.info("pick existing", id, data),
    remove: (id, fileId) => console.info("remove file", id, fileId),
  },
  interviews: {
    add: (id, data) => console.info("add round", id, data),
    edit: (id, roundId, data) => console.info("edit round", id, roundId, data),
    cancel: (id, roundId) => console.info("cancel round", id, roundId),
    saveResult: (id, roundId, data) => console.info("save result", id, roundId, data),
  },
  reminders: {
    add: (id, data) => console.info("add reminder", id, data),
    edit: (id, reminderId, data) => console.info("edit reminder", id, reminderId, data),
    complete: (id, reminderId, done) => console.info("complete reminder", id, reminderId, done),
    snooze: (id, reminderId) => console.info("snooze reminder", id, reminderId),
    dismiss: (id, reminderId) => console.info("dismiss reminder", id, reminderId),
    remove: (id, reminderId) => console.info("delete reminder", id, reminderId),
  },
};

export default function JobDetailPage() {
  const { jobId } = useParams();
  const { status, job, saveStatus, saveJob, retrySave, reload } = useJobDetail(jobId);

  if (status === "loading") return <JobDetailSkeleton />;

  if (status === "not-found") {
    return (
      <StateCard
        icon="?"
        title="Job not found"
        message="This job may have been removed, or the link may be incorrect."
        action={
          <Link className="btn btn-primary" to="/jobs">
            Back to List
          </Link>
        }
      />
    );
  }

  if (status === "error") {
    return (
      <StateCard
        role="alert"
        icon="!"
        title="Could not load job"
        message="Your job details could not be loaded. Try again."
        action={
          <button type="button" className="btn" onClick={reload}>
            Try again
          </button>
        }
      />
    );
  }

  return <JobDetailView job={job} actions={actions} saveStatus={saveStatus} onSave={saveJob} onRetrySave={retrySave} />;
}
