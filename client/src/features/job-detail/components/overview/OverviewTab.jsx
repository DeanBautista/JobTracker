import { Link } from "react-router-dom";
import useToast from "@/hooks/useToast";
import useJobOrigin from "../../hooks/useJobOrigin";
import { CLOSED_STAGES, OFFER_STAGES } from "../../utils/detailOptions";
import { getChanges } from "../../utils/jobForm";
import BasicsPanel from "./BasicsPanel";
import ClosedPanel from "./ClosedPanel";
import DatesPanel from "./DatesPanel";
import DescriptionPanel from "./DescriptionPanel";
import NextUpCard from "./NextUpCard";
import OfferPanel from "./OfferPanel";
import PayPanel from "./PayPanel";

export default function OverviewTab({ job, form, readOnly, onSave, onTabChange }) {
  const { stage } = form.values;
  const { show } = useToast();
  const origin = useJobOrigin();

  const handleSave = () => {
    const changes = getChanges(job, form.values);
    if (Object.keys(changes).length === 0) return show("No changes to save.", { duration: 3000 });
    // Closing a job: send the reason and note shown in the Closed panel.
    if (changes.stage && CLOSED_STAGES.includes(changes.stage)) {
      changes.closure = { reason: form.values.closeReason, note: form.values.closureNote.trim() };
    }
    onSave(changes);
  };

  return (
    <form onSubmit={form.submit(handleSave)} noValidate aria-label="Job overview">
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
            {CLOSED_STAGES.includes(stage) && <ClosedPanel form={form} />}
          </div>
        </fieldset>

        <aside aria-label="Job summary" className="min-w-0">
          <NextUpCard job={job} onTabChange={onTabChange} />
        </aside>
      </div>

      {!readOnly && (
        <div className="flex items-center justify-end gap-2.5 pt-[18px]">
          <Link className="link" to={origin.to}>
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary">
            Save changes
          </button>
        </div>
      )}
    </form>
  );
}