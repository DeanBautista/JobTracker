import { useState } from "react";
import Field from "../../../../components/ui/Field";
import FieldGrid from "../../../../components/ui/FieldGrid";
import Modal from "../../../../components/Modal";
import { INTERVIEW_DURATIONS, INTERVIEW_MODES } from "../../utils/detailOptions";
import { splitDateTime } from "../../utils/formatters";

function InterviewForm({ round, onClose, onSubmit }) {
  const { date, time } = splitDateTime(round?.startsAt);
  const [v, setV] = useState({
    type: round?.type ?? "",
    date,
    time,
    duration: String(round?.durationMin ?? 60),
    mode: round?.mode ?? "video",
    location: round?.location ?? "",
    prepNotes: round?.prepNotes ?? "",
  });
  const bind = (name) => ({ value: v[name], onChange: (e) => setV((p) => ({ ...p, [name]: e.target.value })) });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          type: v.type.trim(),
          startsAt: `${v.date}T${v.time}`,
          durationMin: Number(v.duration),
          mode: v.mode,
          location: v.location.trim(),
          prepNotes: v.prepNotes.trim(),
        });
      }}
    >
      <Modal.Body>
        <FieldGrid>
          <Field id="round-type" label="Round type" full required maxLength={120} placeholder="e.g. Technical interview" {...bind("type")} />
          <Field id="round-date" label="Date" type="date" required {...bind("date")} />
          <Field id="round-time" label="Time" type="time" required {...bind("time")} />
          <Field as="select" id="round-duration" label="Duration" required options={INTERVIEW_DURATIONS} {...bind("duration")} />
          <Field as="select" id="round-mode" label="Mode" required options={INTERVIEW_MODES} {...bind("mode")} />
          <Field
            id="round-location"
            label="Meeting link or address"
            full
            maxLength={500}
            placeholder="https:// or office address"
            {...bind("location")}
          />
          <Field
            as="textarea"
            id="round-prep"
            label="Prep notes"
            full
            rows={3}
            maxLength={3000}
            placeholder="Topics to review, questions to ask..."
            {...bind("prepNotes")}
          />
        </FieldGrid>
      </Modal.Body>
      <Modal.Foot>
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {round ? "Save changes" : "Save round"}
        </button>
      </Modal.Foot>
    </form>
  );
}

// Add when `round` is undefined, edit (and reschedule) when given.
export default function InterviewDialog({ open, job, round, onClose, onSubmit }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={round ? "Edit interview round" : "Add interview round"}
      description={round ? "Update the time, format, or preparation notes." : `Schedule a round for ${job.title} at ${job.company}.`}
    >
      <InterviewForm round={round} onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
}
