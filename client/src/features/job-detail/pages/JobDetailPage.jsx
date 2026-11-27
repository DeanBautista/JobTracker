import { Link, useNavigate, useParams } from "react-router-dom";
import useToast from "@/hooks/useToast";
import StateCard from "@/components/ui/StateCard";
import JobDetailSkeleton from "../components/JobDetailSkeleton";
import JobDetailView from "../components/JobDetailView";
import useJobDetail from "../hooks/useJobDetail";
import { getApiError } from "@/lib/api";
import useJobOrigin from "../hooks/useJobOrigin";
import { archiveJobs, notifyJobsChanged, restoreJobs, trashJobs, unarchiveJobs } from "@/features/jobs";

// Placeholders until the API exists. Every action takes the job id first.
const placeholderActions = {
  job: {
    archive: (id) => console.info("archive", id),
    unarchive: (id) => console.info("unarchive", id),
    restore: (id) => console.info("restore", id),
    remove: (id) => console.info("move to trash", id),
  },
  notes: {
    add: (id, text) => console.info("add note", id, text),
    edit: (id, noteId, data) => console.info("edit note", id, noteId, data),
    togglePin: (id, noteId, pinned) => console.info("pin note", id, noteId, pinned),
    remove: (id, noteId) => console.info("delete note", id, noteId),
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
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const origin = useJobOrigin();
  const { show } = useToast();
  const { status, job, saveStatus, saveJob, reload, patchJob } = useJobDetail(jobId);

  const run = async (request, onDone) => {
    try {
      await request();
      onDone();
    } catch (err) {
      show(getApiError(err).message);
    }
  };

  const undoTrash = async (id) => {
    try {
      await restoreJobs([Number(id)]);
      notifyJobsChanged();
      show("Job restored.");
    } catch {
      show("Could not undo. Restore it from Trash.");
    }
  };

  const actions = {
    ...placeholderActions,
    job: {
      ...placeholderActions.job,
      archive: (id) =>
        run(() => archiveJobs([Number(id)]), () => {
          patchJob({ archived: true });
          notifyJobsChanged();
          show("Job archived.");
        }),
      unarchive: (id) =>
        run(() => unarchiveJobs([Number(id)]), () => {
          patchJob({ archived: false });
          notifyJobsChanged();
          show("Job unarchived.");
        }),
      restore: (id) =>
        run(() => restoreJobs([Number(id)]), () => {
          patchJob({ deletedAt: null });
          notifyJobsChanged();
          show("Job restored.");
        }),
      remove: (id) =>
        run(() => trashJobs([Number(id)]), () => {
          notifyJobsChanged();
          navigate(origin.to, { state: { skipLeaveGuard: true } });
          show("Job moved to Trash.", { action: { label: "Undo", onClick: () => undoTrash(id) } });
        }),
    },
  };

  const setCount = (key, value) => patchJob((j) => ({ counts: { ...j.counts, [key]: value } }));

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

  return (
    <JobDetailView
      job={job}
      actions={actions}
      saveStatus={saveStatus}
      onSave={saveJob}
      onCountChange={setCount}
    />
  );
}