import { useEffect, useRef, useState } from "react";
import Banner from "../../../components/ui/Banner";
import Breadcrumbs from "../../../components/ui/Breadcrumbs";
import scrollToTop from "@/lib/scrollToTop";
import useJobForm from "../hooks/useJobForm";
import useJobOrigin from "../hooks/useJobOrigin";
import useJobTab from "../hooks/useJobTab";
import useJobReminders from "../hooks/useJobReminders";
import useUnsavedChangesGuard from "../hooks/useUnsavedChangesGuard";
import { CLOSED_STAGES, JOB_TABS } from "../utils/detailOptions";
import { formatDate } from "../utils/formatters";
import { getChanges } from "../utils/jobForm";
import ArchiveJobDialog from "./ArchiveJobDialog";
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
import UnsavedChangesDialog from "./UnsavedChangesDialog";

export default function JobDetailView({ job, actions, saveStatus, onSave, onCountChange }) {
  const [tab, setTab] = useJobTab();
  const reminders = useJobReminders(job.id, tab === "reminders", onCountChange);
  const origin = useJobOrigin();
  const form = useJobForm(job);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [reminderDialog, setReminderDialog] = useState(null); // null | { reminder? }
  const [failed, setFailed] = useState(null); // null | { patch, snapshot }
  const mounted = useRef(false);

  const readOnly = Boolean(job.archived || job.deletedAt);
  const counts = job.counts;

  const dirty = !readOnly && Object.keys(getChanges(job, form.values)).length > 0;
  const saving = saveStatus === "saving";
  const leaveGuard = useUnsavedChangesGuard(dirty || saving);

  // "Could not save" only applies while the form still matches the failed attempt.
  let displayStatus = dirty ? "unsaved" : "saved";
  if (saving) displayStatus = "saving";
  else if (saveStatus === "error" && dirty && failed?.snapshot === JSON.stringify(form.values)) {
    displayStatus = "error";
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Archiving makes fields read-only, so discard edits once it succeeds.
  useEffect(() => {
    if (!job.archived) return;
    form.reset(job);
    setFailed(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job.archived]);

  const save = async (patch, { scroll = false } = {}) => {
    const submitted = form.values;
    setFailed(null);

    const result = await onSave(patch);
    if (!result || !mounted.current) return;

    if (result.ok) form.syncSaved(result.job, patch, submitted);
    else setFailed({ patch, snapshot: JSON.stringify(submitted) });

    if (scroll) scrollToTop();
  };

  const handleRetry = () => {
    if (failed) save(failed.patch, { scroll: true });
  };

  // Title autosaves on blur (no scrolling). Stage and priority wait for Save changes.
  const handleTitleBlur = () => {
    const title = form.values.title.trim();
    if (!title) return form.setError("title", "Enter a job title.");
    if (title !== job.title) save({ title });
  };
  const handleStageChange = (stage) => {
    // Reopening: reset the closed-job fields so they don't count as unsaved changes.
    if (CLOSED_STAGES.includes(form.values.stage) && !CLOSED_STAGES.includes(stage)) {
      form.setValue("closeReason", "other");
      form.setValue("closureNote", "");
    }
    form.setValue("stage", stage);
  };
  const handlePriorityChange = (priority) => form.setValue("priority", priority);

  const handleReminderSubmit = async (data) => {
    const current = reminderDialog?.reminder;
    const ok = current ? await reminders.edit(current.id, data) : await reminders.add(data);
    if (ok) setReminderDialog(null);
  };

  return (
    <>
      <Breadcrumbs items={[origin, { label: job.title }]} />

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
        onArchive={() => setArchiveOpen(true)}
        onDelete={() => setDeleteOpen(true)}
        onAddReminder={() => setReminderDialog({})}
      />
      <SaveStatus status={displayStatus} hidden={readOnly} onRetry={handleRetry} />
      <JobTabs tabs={JOB_TABS} active={tab} counts={counts} />

      {tab === "overview" && (
        <OverviewTab
          job={job}
          form={form}
          readOnly={readOnly}
          onSave={(changes) => save(changes, { scroll: true })}
          onInvalid={scrollToTop}
          onTabChange={setTab}
        />
      )}
      {tab === "notes" && <NotesTab job={job} readOnly={readOnly} onCountChange={onCountChange} />}
      {tab === "timeline" && <TimelineTab job={job} />}
      {tab === "documents" && <DocumentsTab job={job} readOnly={readOnly} onCountChange={onCountChange} />}
      {tab === "interviews" && <InterviewsTab job={job} readOnly={readOnly} onCountChange={onCountChange} />}
      {tab === "reminders" && (
        <RemindersTab
          job={job}
          reminders={reminders}
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
      <ArchiveJobDialog
        open={archiveOpen}
        job={job}
        hasUnsavedChanges={dirty}
        onClose={() => setArchiveOpen(false)}
        onConfirm={() => {
          actions.job.archive(job.id);
          setArchiveOpen(false);
        }}
      />
      <ReminderDialog
        open={Boolean(reminderDialog)}
        reminder={reminderDialog?.reminder}
        job={job}
        onClose={() => setReminderDialog(null)}
        onSubmit={handleReminderSubmit}
      />
      <UnsavedChangesDialog
        open={leaveGuard.open}
        saving={saving}
        onStay={leaveGuard.stay}
        onLeave={leaveGuard.leave}
      />
    </>
  );
}