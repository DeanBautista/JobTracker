import { FIELD_CLASS, TEXTAREA_CLASS } from "../../utils/jobFormOptions";
import { CURRENCIES, PAY_PERIODS } from "../../utils/jobOptions";
import JobField from "../shared/JobField";

// Shown in the Add job dialog while the stage is Offer or Accepted.
export default function AddJobOfferFields({ errors }) {
  return (
    <section aria-labelledby="add-offer-heading" className="mt-[18px] rounded-lg border border-rule bg-paper">
      <div className="border-b border-rule px-4 py-3">
        <h3 id="add-offer-heading" className="font-medium">Offer details</h3>
        <p className="mt-0.5 text-sm text-muted">Track the terms and reply date. All optional.</p>
      </div>

      <div className="grid grid-cols-1 gap-x-[18px] gap-y-4 px-4 py-[18px] sm:grid-cols-2">
        <JobField label="Offer salary" error={errors.offerSalary}>
          {(p) => (
            <input
              {...p}
              name="offerSalary"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              className={FIELD_CLASS}
            />
          )}
        </JobField>

        <JobField label="Currency" error={errors.offerCurrency}>
          {(p) => (
            <select {...p} name="offerCurrency" defaultValue="PHP" className={FIELD_CLASS}>
              {CURRENCIES.map((c) => {
                const { value, label } = typeof c === "string" ? { value: c, label: c } : c;
                return <option key={value} value={value}>{label}</option>;
              })}
            </select>
          )}
        </JobField>

        <JobField label="Period" error={errors.offerPeriod}>
          {(p) => (
            <select {...p} name="offerPeriod" defaultValue="" className={FIELD_CLASS}>
              <option value="">Not set</option>
              {PAY_PERIODS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          )}
        </JobField>

        <JobField label="Reply by" error={errors.offerRespondBy}>
          {(p) => <input {...p} name="offerRespondBy" type="date" className={FIELD_CLASS} />}
        </JobField>

        <JobField label="Notes" error={errors.offerNotes} className="sm:col-span-2">
          {(p) => <textarea {...p} name="offerNotes" maxLength={3000} className={TEXTAREA_CLASS} />}
        </JobField>
      </div>
    </section>
  );
}