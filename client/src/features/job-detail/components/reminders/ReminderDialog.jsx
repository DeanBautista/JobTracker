import { useState } from "react";
import Field from "../../../../components/ui/Field";
import FieldGrid from "../../../../components/ui/FieldGrid";
import Modal from "../../../../components/Modal";
import { REMINDER_ORIGINS } from "../../utils/detailOptions";
import { splitDateTime } from "../../utils/formatters";

function ReminderForm({ reminder, onClose, onSubmit }) {
  const { date, time } = splitDateTime(reminder?.dueAt);
  const [v, setV] = useState({
    title: reminder?.title ?? "",
    date,
    time: reminder?.hasTime ? time : "",
    origin: reminder?.origin ?? "manual",
    note: reminder?.note ?? "",
  });
  const bind = (name) => ({ value: v[name], onChange: (e) => setV((p) => ({ ...p, [name]: e.target.value })) });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          title: v.title.trim(),
          dueAt: `${v.date}T${v.time || "09:00"}`,
          hasTime: Boolean(v.time),
          origin: v.origin,
          note: v.note.trim(),
        });
      }}
    >
      <Modal.Body>
        <FieldGrid>
          <Field id="reminder-title" label="Reminder" full required maxLength={160} placeholder="e.g. Follow up with recruiter" {...bind("title")} />
          <Field id="reminder-date" label="Due date" type="date" required {...bind("date")} />
          <Field id="reminder-time" label="Time" type="time" {...bind("time")} />
          <Field as="select" id="reminder-origin" label="Origin" full options={REMINDER_ORIGINS} {...bind("origin")} />
          <Field as="textarea" id="reminder-note" label="Note" full rows={2} maxLength={1000} placeholder="Optional details" {...bind("note")} />
        </FieldGrid>
      </Modal.Body>
      <Modal.Foot>
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {reminder ? "Save changes" : "Save reminder"}
        </button>
      </Modal.Foot>
    </form>
  );
}

// Add when `reminder` is undefined, edit when given. Opened from the header and the reminders tab.
export default function ReminderDialog({ open, job, reminder, onClose, onSubmit }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={reminder ? "Edit reminder" : "Add reminder"}
      description={reminder ? "Update the reminder date or details." : `This reminder is for ${job.title} at ${job.company}.`}
    >
      <ReminderForm reminder={reminder} onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
}
