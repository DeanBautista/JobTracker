import { Link } from "react-router-dom";
import Modal from "@/components/Modal";
import useAddJobForm from "../../hooks/useAddJobForm";
import { FIELD_CLASS, STAGE_OPTIONS } from "../../utils/jobFormOptions";
import AddJobMoreDetails from "./AddJobMoreDetails";
import JobField from "../shared/JobField";

export default function AddJobDialog({ onClose }) {
  const { errors, formError, duplicate, saving, submit, clearDuplicate } = useAddJobForm({
    onDone: onClose,
  });
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Modal labelledBy="add-job-title" onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="px-6 pt-[22px] max-sm:px-4">
          <h2 id="add-job-title" className="font-serif text-2xl leading-tight font-medium tracking-[-0.01em]">
            Add job
          </h2>
          <p className="mt-1 text-sm text-muted">
            Title and company are enough to start. Add the rest later.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-[18px] pb-[22px] max-sm:px-4">
          {(hasErrors || formError) && (
            <p
              role="alert"
              className="mb-4 rounded-md border border-l-[3px] border-danger bg-danger-soft px-3.5 py-3 text-sm font-medium text-danger"
            >
              {formError || "Fix the highlighted fields and try again."}
            </p>
          )}

          <div className="grid grid-cols-1 gap-x-[18px] gap-y-4 sm:grid-cols-2">
            <JobField label="Job title *" error={errors.title} className="sm:col-span-2">
              {(p) => (
                <input
                  {...p}
                  name="title"
                  type="text"
                  placeholder="Frontend Developer"
                  maxLength={200}
                  autoComplete="off"
                  aria-required="true"
                  data-autofocus
                  className={FIELD_CLASS}
                />
              )}
            </JobField>

            <JobField label="Company *" error={errors.company}>
              {(p) => (
                <input
                  {...p}
                  name="company"
                  type="text"
                  placeholder="Northwind"
                  maxLength={120}
                  autoComplete="off"
                  aria-required="true"
                  className={FIELD_CLASS}
                />
              )}
            </JobField>

            <JobField label="Stage">
              {(p) => (
                <select {...p} name="stage" defaultValue="wishlist" className={FIELD_CLASS}>
                  {STAGE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              )}
            </JobField>

            <div className="sm:col-span-2">
              <JobField label="Link" hint="The posting or company page." error={errors.link}>
                {(p) => (
                  <input
                    {...p}
                    name="link"
                    type="url"
                    placeholder="https://"
                    maxLength={2000}
                    inputMode="url"
                    autoComplete="off"
                    onChange={clearDuplicate}
                    className={FIELD_CLASS}
                  />
                )}
              </JobField>

              {duplicate && (
                <div
                  role="status"
                  className="mt-2.5 rounded-md border border-l-[3px] border-rule border-l-danger bg-danger-soft px-3.5 py-3 text-sm"
                >
                  <strong className="block text-danger">You already added this link</strong>
                  {duplicate.title} at {duplicate.company} is already in your list.
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <Link to={`/jobs/${duplicate.id}`} onClick={onClose} className="link">
                      Open the existing job
                    </Link>
                    <button
                      type="submit"
                      name="confirm_duplicate"
                      value="1"
                      disabled={saving}
                      className="btn btn-sm"
                    >
                      Add anyway
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <AddJobMoreDetails errors={errors} />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 border-t border-rule bg-surface px-6 py-4 max-sm:flex-col-reverse max-sm:items-stretch max-sm:px-4">
          <button type="submit" disabled={saving} className="btn btn-primary max-sm:w-full">
            {saving ? "Saving..." : "Add job"}
          </button>
          <button type="submit" name="another" value="1" disabled={saving} className="btn max-sm:w-full">
            Save and add another
          </button>
          <span className="flex-1 max-sm:hidden" />
          <button type="button" onClick={onClose} className="btn max-sm:w-full">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}