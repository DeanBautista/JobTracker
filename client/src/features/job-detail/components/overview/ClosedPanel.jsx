import Field from "../../../../components/ui/Field";
import FieldGrid from "../../../../components/ui/FieldGrid";
import Panel from "../../../../components/ui/Panel";
import TextBadge from "../../../../components/ui/TextBadge";
import { CLOSE_REASONS, PREVIOUS_STAGES, STAGE_LABELS } from "../../utils/detailOptions";

// Shown while the stage is Accepted, Rejected, Withdrawn or Ghosted.
export default function ClosedPanel({ form, readOnly, onEdit, onReopen }) {
  return (
    <Panel aria-labelledby="closed-heading">
      <Panel.Head
        id="closed-heading"
        title="Closed job"
        description="Reason and outcome history"
        aside={<TextBadge>{STAGE_LABELS[form.values.stage]}</TextBadge>}
      />
      <Panel.Body>
        <FieldGrid>
          <Field as="select" id="close-reason" label="Reason" options={CLOSE_REASONS} {...form.bind("closeReason")} />
          <Field as="select" id="previous-stage" label="Stage it was in" options={PREVIOUS_STAGES} {...form.bind("previousStage")} />
          <Field id="closed-date" label="Closed date" type="date" {...form.bind("closedDate")} />
          <Field as="textarea" id="closure-note" label="Note" full maxLength={2000} {...form.bind("closureNote")} />
        </FieldGrid>
        {!readOnly && (
          <div className="mt-3.5 flex flex-wrap gap-2">
            <button type="button" className="btn btn-sm" onClick={onEdit}>
              Edit
            </button>
            <button type="button" className="btn btn-sm" onClick={onReopen}>
              Reopen
            </button>
          </div>
        )}
      </Panel.Body>
    </Panel>
  );
}
