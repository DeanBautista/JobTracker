import { useState } from "react";
import Field from "../../../../components/ui/Field";
import FieldGrid from "../../../../components/ui/FieldGrid";
import Modal from "../../../../components/Modal";
import { splitDateTime } from "../../utils/formatters";

const DEFAULT_TIME = "09:00";

// Local-date YYYY-MM-DD (toISOString would shift the day in UTC+8)
function tomorrowInputValue() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function ReminderForm({ reminder, onClose, onSubmit }) {
  const { date, time } = splitDateTime(reminder?.dueAt);
  const [v, setV] = useState({
    title: reminder?.title ?? "",
    date: reminder ? date : tomorrowInputValue(),
    time: reminder ? time || DEFAULT_TIME : DEFAULT_TIME,
    note: reminder?.note ?? "",
  });
  const bind = (name) => ({ value: v[name], onChange: (e) => setV((p) => ({ ...p, [name]: e.target.value })) });

  return (
    <form
      className="flex min-h-0 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          title: v.title.trim(),
          dueAt: new Date(`${v.date}T${v.time}`).toISOString(),
          note: v.note.trim(),
        });
      }}
    >
      <div className="overflow-y-auto px-5 py-4">
        <FieldGrid>
          <Field id="reminder-title" label="Reminder" full required maxLength={160} placeholder="e.g. Follow up with recruiter" {...bind("title")} />
          <Field id="reminder-date" label="Due date" type="date" required {...bind("date")} />
          <Field id="reminder-time" label="Time" type="time" required {...bind("time")} />
          <Field as="textarea" id="reminder-note" label="Note" full rows={2} maxLength={1000} placeholder="Optional details" {...bind("note")} />
        </FieldGrid>
      </div>
      <div className="flex justify-end gap-2 border-t border-rule px-5 py-3">
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {reminder ? "Save changes" : "Save reminder"}
        </button>
      </div>
    </form>
  );
}

export default function ReminderDialog({ open, job, reminder, onClose, onSubmit }) {
  if (!open) return null; // Modal opens on mount, so unmount to close

  return (
    <Modal labelledBy="reminder-dialog-title" onClose={onClose}>
      <div className="border-b border-rule px-5 py-4">
        <h2 id="reminder-dialog-title" className="text-base font-semibold">
          {reminder ? "Edit reminder" : "Add reminder"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {reminder ? "Update the reminder date or details." : `This reminder is for ${job.title} at ${job.company}.`}
        </p>
      </div>
      <ReminderForm reminder={reminder} onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
}