import Field from "../../../../components/ui/Field";
import FieldGrid from "../../../../components/ui/FieldGrid";
import Panel from "../../../../components/ui/Panel";

export default function DatesPanel({ form }) {
  return (
    <Panel aria-labelledby="dates-heading">
      <Panel.Head id="dates-heading" title="Dates" description="Keep important dates in one place" />
      <Panel.Body>
        <FieldGrid>
          <Field id="date-posted" label="Date posted" type="date" {...form.bind("datePosted")} />
          <Field id="date-applied" label="Date applied" type="date" {...form.bind("dateApplied")} />
          <Field id="deadline" label="Deadline" type="date" {...form.bind("deadline")} />
        </FieldGrid>
      </Panel.Body>
    </Panel>
  );
}
