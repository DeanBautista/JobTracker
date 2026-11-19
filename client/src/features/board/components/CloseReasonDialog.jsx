import { useId, useState } from "react";
import Modal from "@/components/Modal";
import { FIELD_CLASS, TEXTAREA_CLASS } from "@/features/jobs/utils/jobFormOptions";
import { CLOSE_REASONS, STAGE_LABELS } from "../utils/boardStages";

export default function CloseReasonDialog({ job, stage, onConfirm, onCancel }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const reasonId = useId();
  const noteId = useId();

  const submit = (e) => {
    e.preventDefault();
    onConfirm({ reason: reason || null, note: note.trim() || null });
  };

  return (
    <Modal labelledBy="close-reason-title" onClose={onCancel}>
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="px-6 pt-[22px] max-sm:px-4">
          <h2 id="close-reason-title" className="font-serif text-2xl leading-tight font-medium tracking-[-0.01em]">
            Move to {STAGE_LABELS[stage]}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {job.title} at {job.company}. Why did it close? You can skip this.
          </p>
        </div>

        <div className="grid gap-4 px-6 pt-[18px] pb-[22px] max-sm:px-4">
          <div>
            <label htmlFor={reasonId} className="mb-1.5 block text-sm font-medium">Reason</label>
            <select
              id={reasonId}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              data-autofocus
              className={FIELD_CLASS}
            >
              <option value="">Not set</option>
              {CLOSE_REASONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={noteId} className="mb-1.5 block text-sm font-medium">Note</label>
            <textarea
              id={noteId}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={1000}
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-rule bg-surface px-6 py-4 max-sm:flex-col-reverse max-sm:items-stretch max-sm:px-4">
          <button type="button" onClick={onCancel} className="btn max-sm:w-full">Cancel</button>
          <button type="submit" className="btn btn-primary max-sm:w-full">Move to {STAGE_LABELS[stage]}</button>
        </div>
      </form>
    </Modal>
  );
}