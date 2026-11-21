import Field from "@/components/ui/Field";
import FieldGrid from "@/components/ui/FieldGrid";
import Panel from "@/components/ui/Panel";
import TextBadge from "@/components/ui/TextBadge";
import { CLOSE_REASONS, STAGE_LABELS } from "../../utils/detailOptions";

// Shown while the stage is Accepted, Rejected, Withdrawn or Ghosted.
// To reopen a job, pick an open stage in the header and save.
export default function ClosedPanel({ form }) {
  return (
    <Panel aria-labelledby="closed-heading">
      <Panel.Head
        id="closed-heading"
        title="Closed job"
        description="Why this job closed"
        aside={<TextBadge>{STAGE_LABELS[form.values.stage]}</TextBadge>}
      />
      <Panel.Body>
        <FieldGrid>
          <Field as="select" id="close-reason" label="Reason" options={CLOSE_REASONS} {...form.bind("closeReason")} />
          <Field as="textarea" id="closure-note" label="Note" full maxLength={1000} {...form.bind("closureNote")} />
        </FieldGrid>
      </Panel.Body>
    </Panel>
  );
}