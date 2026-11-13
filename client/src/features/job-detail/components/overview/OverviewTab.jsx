import { Link } from "react-router-dom";
import { CLOSED_STAGES, OFFER_STAGES } from "../../utils/detailOptions";
import BasicsPanel from "./BasicsPanel";
import ClosedPanel from "./ClosedPanel";
import DangerZone from "./DangerZone";
import DatesPanel from "./DatesPanel";
import DescriptionPanel from "./DescriptionPanel";
import NextUpCard from "./NextUpCard";
import OfferPanel from "./OfferPanel";
import PayPanel from "./PayPanel";

// Archived / trashed jobs reuse the same panels: the <fieldset disabled> makes
// every control read-only, so there is no second read-only copy of the markup.
export default function OverviewTab({ job, form, readOnly, actions, onSave, onDelete, onTabChange }) {
  const { stage } = form.values;

  return (
    <form onSubmit={form.submit(onSave)} noValidate aria-label="Job overview">
      {form.showSummary && (
        <div role="alert" className="mb-[18px] rounded-[7px] border border-danger bg-danger-soft px-3.5 py-2.5 text-meta text-danger">
          Please fix the highlighted fields before saving.
        </div>
      )}

      <div className="grid items-start gap-5 split:grid-cols-[minmax(0,1.65fr)_minmax(15rem,0.8fr)]">
        <fieldset disabled={readOnly} className="min-w-0">
          <div className="grid gap-[18px]">
            <BasicsPanel form={form} />
            <PayPanel form={form} />
            <DatesPanel form={form} />
            <DescriptionPanel form={form} />
            {OFFER_STAGES.includes(stage) && <OfferPanel form={form} />}
            {CLOSED_STAGES.includes(stage) && (
              <ClosedPanel
                form={form}
                readOnly={readOnly}
                onEdit={() => actions.editClosure(job.id, form.values)}
                onReopen={() => actions.reopen(job.id)}
              />
            )}
          </div>
        </fieldset>

        <aside aria-label="Job summary" className="min-w-0">
          <NextUpCard job={job} onTabChange={onTabChange} />
        </aside>
      </div>

      {!readOnly && (
        <>
          <DangerZone onArchive={() => actions.archive(job.id)} onDelete={onDelete} />
          <div className="flex items-center justify-end gap-2.5 pt-[18px]">
            <Link className="link" to="/jobs">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary">
              Save changes
            </button>
          </div>
        </>
      )}
    </form>
  );
}
