import SegmentedControl from "@/components/SegmentedControl";
import {
  FIELD_CLASS,
  PRIORITY_OPTIONS,
  SOURCE_SUGGESTIONS,
  TEXTAREA_CLASS,
  WORK_MODE_OPTIONS,
} from "../../utils/jobFormOptions";
import { EMPLOYMENT_TYPES, PAY_PERIODS } from "../../utils/jobOptions";
import JobField from "../shared/JobField";

function Options({ options }) {
  return (
    <>
      <option value="">Not set</option>
      {options.map(({ value, label }) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </>
  );
}

export default function AddJobMoreDetails({ errors }) {
  return (
    <details className="group mt-[18px] rounded-lg border border-rule bg-paper">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-medium [&::-webkit-details-marker]:hidden">
        More details
        <span
          aria-hidden="true"
          className="size-2 -translate-y-0.5 rotate-45 border-r-2 border-b-2 border-muted transition-transform group-open:-rotate-135 motion-reduce:transition-none"
        />
      </summary>

      <div className="border-t border-rule px-4 pt-[18px] pb-[18px]">
        <div className="grid grid-cols-1 gap-x-[18px] gap-y-4 sm:grid-cols-2">
          <JobField label="Source">
            {(p) => <input {...p} name="source" type="text" list="job-sources" maxLength={60} autoComplete="off" className={FIELD_CLASS} />}
          </JobField>
          <JobField label="Referred by">
            {(p) => <input {...p} name="referredBy" type="text" maxLength={100} autoComplete="off" className={FIELD_CLASS} />}
          </JobField>
          <JobField label="Location">
            {(p) => <input {...p} name="location" type="text" placeholder="Manila, or Remote" maxLength={100} autoComplete="off" className={FIELD_CLASS} />}
          </JobField>
          <JobField label="Work mode">
            {(p) => <select {...p} name="workMode" defaultValue="" className={FIELD_CLASS}><Options options={WORK_MODE_OPTIONS} /></select>}
          </JobField>
          <JobField label="Employment type" className="sm:col-span-2">
            {(p) => <select {...p} name="employmentType" defaultValue="" className={FIELD_CLASS}><Options options={EMPLOYMENT_TYPES} /></select>}
          </JobField>

          <fieldset className="min-w-0 sm:col-span-2">
            <legend className="mb-1.5 text-sm font-medium">Salary</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_96px_1fr]">
              <JobField label="Min" compact>
                {(p) => <input {...p} name="salaryMin" type="number" min="0" step="any" inputMode="decimal" className={FIELD_CLASS} />}
              </JobField>
              <JobField label="Max" compact error={errors.salaryMax}>
                {(p) => <input {...p} name="salaryMax" type="number" min="0" step="any" inputMode="decimal" className={FIELD_CLASS} />}
              </JobField>
              <JobField label="Currency" compact error={errors.currency}>
                {(p) => <input {...p} name="currency" type="text" placeholder="PHP" maxLength={3} autoCapitalize="characters" autoComplete="off" className={`${FIELD_CLASS} uppercase`} />}
              </JobField>
              <JobField label="Period" compact>
                {(p) => <select {...p} name="salaryPeriod" defaultValue="" className={FIELD_CLASS}><Options options={PAY_PERIODS} /></select>}
              </JobField>
            </div>
          </fieldset>

          <JobField label="Date posted">
            {(p) => <input {...p} name="datePosted" type="date" className={FIELD_CLASS} />}
          </JobField>
          <JobField label="Date applied">
            {(p) => <input {...p} name="dateApplied" type="date" className={FIELD_CLASS} />}
          </JobField>
          <JobField label="Deadline">
            {(p) => <input {...p} name="deadline" type="date" className={FIELD_CLASS} />}
          </JobField>
          <SegmentedControl name="priority" legend="Priority" options={PRIORITY_OPTIONS} defaultValue="medium" />

          <JobField
            label="Job description"
            hint="Paste the posting so you still have it when it is taken down"
            className="sm:col-span-2"
          >
            {(p) => <textarea {...p} name="description" maxLength={20000} className={TEXTAREA_CLASS} />}
          </JobField>
        </div>
      </div>

      <datalist id="job-sources">
        {SOURCE_SUGGESTIONS.map((source) => <option key={source} value={source} />)}
      </datalist>
    </details>
  );
}