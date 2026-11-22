import Field from "../../../../components/ui/Field";
import Panel from "../../../../components/ui/Panel";

export default function DescriptionPanel({ form }) {
  return (
    <Panel aria-labelledby="description-heading">
      <Panel.Head id="description-heading" title="Description" description="Notes copied from the job posting" />
      <Panel.Body>
        <Field
          as="textarea"
          id="description"
          label="Job description"
          hideLabel
          maxLength={6000}
          controlClassName="min-h-[150px] resize-y"
          help="Keep useful requirements, responsibilities, and details from the posting. Drag the bottom-right corner to make the box taller."
          {...form.bind("description")}
        />
      </Panel.Body>
    </Panel>
  );
}