import { CLOSE_REASON_OPTIONS, FIELD_CLASS, TEXTAREA_CLASS } from "../../utils/jobFormOptions";
import JobField from "../shared/JobField";

// Shown in the Add job dialog while the stage is Rejected, Withdrawn or Ghosted.
export default function AddJobClosedFields({ errors }) {
  return (
    <section aria-labelledby="add-closed-heading" className="mt-[18px] rounded-lg border border-rule bg-paper">
      <div className="border-b border-rule px-4 py-3">
        <h3 id="add-closed-heading" className="font-medium">Why it closed</h3>
        <p className="mt-0.5 text-sm text-muted">Optional. You can fill this in later.</p>
      </div>

      <div className="grid grid-cols-1 gap-x-[18px] gap-y-4 px-4 py-[18px]">
        <JobField label="Reason" error={errors.closedReason}>
          {(p) => (
            <select {...p} name="closedReason" defaultValue="" className={FIELD_CLASS}>
              <option value="">Not set</option>
              {CLOSE_REASON_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          )}
        </JobField>

        <JobField label="Note" error={errors.closingNote}>
          {(p) => <textarea {...p} name="closingNote" maxLength={1000} className={TEXTAREA_CLASS} />}
        </JobField>
      </div>
    </section>
  );
}