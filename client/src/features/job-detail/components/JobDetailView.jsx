import { useState } from "react";
import Banner from "../../../components/ui/Banner";
import Breadcrumbs from "../../../components/ui/Breadcrumbs";
import useJobForm from "../hooks/useJobForm";
import useJobTab from "../hooks/useJobTab";
import { JOB_TABS } from "../utils/detailOptions";
import { formatDate } from "../utils/formatters";
import DeleteJobDialog from "./DeleteJobDialog";
import DocumentsTab from "./documents/DocumentsTab";
import InterviewsTab from "./interviews/InterviewsTab";
import JobDetailHeader from "./JobDetailHeader";
import JobTabs from "./JobTabs";
import NotesTab from "./notes/NotesTab";
import OverviewTab from "./overview/OverviewTab";
import ReminderDialog from "./reminders/ReminderDialog";
import RemindersTab from "./reminders/RemindersTab";
import SaveStatus from "./SaveStatus";
import TimelineTab from "./timeline/TimelineTab";

// Rendered only once the job has loaded, so the form hook always has data.
export default function JobDetailView({ job, actions, saveStatus, onSave, onRetrySave }) {
  const [tab, setTab] = useJobTab();
  const form = useJobForm(job);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reminderDialog, setReminderDialog] = useState(null); // null | { reminder? }

  const readOnly = Boolean(job.archived || job.deletedAt);
  const counts = {
    notes: job.notes.length,
    documents: job.documents.length,
    interviews: job.interviews.length,
    reminders: job.reminders.length,
  };

  // Header fields autosave; everything else saves from the overview form.
  const handleTitleBlur = () => {
    const title = form.values.title.trim();
    if (!title) return form.setError("title", "Enter a job title.");
    if (title !== job.title) onSave({ title });
  };
  const handleStageChange = (stage) => {
    form.setValue("stage", stage);
    onSave({ stage });
  };
  const handlePriorityChange = (priority) => {
    form.setValue("priority", priority);
    onSave({ priority });
  };

  const handleReminderSubmit = (data) => {
    if (reminderDialog?.reminder) actions.reminders.edit(job.id, reminderDialog.reminder.id, data);
    else actions.reminders.add(job.id, data);
    setReminderDialog(null);
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "List", to: "/jobs" }, { label: job.title }]} />

      {job.archived && (
        <Banner
          tone="accent"
          action={
            <button type="button" className="btn btn-sm" onClick={() => actions.job.unarchive(job.id)}>
              Unarchive
            </button>
          }
        >
          <strong className="font-semibold">This job is archived.</strong> Its fields are read-only.
        </Banner>
      )}
      {job.deletedAt && (
        <Banner
          tone="danger"
          action={
            <button type="button" className="btn btn-sm" onClick={() => actions.job.restore(job.id)}>
              Restore
            </button>
          }
        >
          <strong className="font-semibold text-danger">In Trash</strong>, deleted on {formatDate(job.deletedAt)}. Fields are
          read-only.
        </Banner>
      )}

      <JobDetailHeader
        job={job}
        form={form}
        readOnly={readOnly}
        onTitleBlur={handleTitleBlur}
        onStageChange={handleStageChange}
        onPriorityChange={handlePriorityChange}
        onArchive={() => actions.job.archive(job.id)}
        onDelete={() => setDeleteOpen(true)}
        onAddReminder={() => setReminderDialog({})}
      />
      <SaveStatus status={saveStatus} hidden={readOnly} onRetry={onRetrySave} />
      <JobTabs tabs={JOB_TABS} active={tab} counts={counts} />

      {tab === "overview" && (
        <OverviewTab
          job={job}
          form={form}
          readOnly={readOnly}
          actions={actions.job}
          onSave={onSave}
          onDelete={() => setDeleteOpen(true)}
          onTabChange={setTab}
        />
      )}
      {tab === "notes" && <NotesTab job={job} readOnly={readOnly} actions={actions.notes} />}
      {tab === "timeline" && <TimelineTab job={job} />}
      {tab === "documents" && <DocumentsTab job={job} readOnly={readOnly} actions={actions.documents} />}
      {tab === "interviews" && <InterviewsTab job={job} readOnly={readOnly} actions={actions.interviews} />}
      {tab === "reminders" && (
        <RemindersTab
          job={job}
          readOnly={readOnly}
          actions={actions.reminders}
          onAdd={() => setReminderDialog({})}
          onEdit={(reminder) => setReminderDialog({ reminder })}
        />
      )}

      <DeleteJobDialog
        open={deleteOpen}
        job={job}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          actions.job.remove(job.id);
          setDeleteOpen(false);
        }}
      />
      <ReminderDialog
        open={Boolean(reminderDialog)}
        reminder={reminderDialog?.reminder}
        job={job}
        onClose={() => setReminderDialog(null)}
        onSubmit={handleReminderSubmit}
      />
    </>
  );
}
