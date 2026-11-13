import Field from "../../../../components/ui/Field";
import FieldGrid from "../../../../components/ui/FieldGrid";
import Panel from "../../../../components/ui/Panel";
import { EMPLOYMENT_TYPES, SOURCES, WORK_MODES } from "../../utils/detailOptions";

export default function BasicsPanel({ form }) {
  return (
    <Panel aria-labelledby="basics-heading">
      <Panel.Head id="basics-heading" title="Basics" description="Role and hiring details" />
      <Panel.Body>
        <FieldGrid>
          <Field id="title-basic" label="Title" required maxLength={120} {...form.bind("title")} />
          <Field id="company" label="Company" required maxLength={120} autoComplete="organization" {...form.bind("company")} />
          <Field
            id="posting-url"
            label="Link"
            full
            type="url"
            maxLength={500}
            placeholder="https://"
            autoComplete="url"
            {...form.bind("link")}
          />
          <Field id="source" label="Source" maxLength={80} list="source-list" autoComplete="off" {...form.bind("source")}>
            <datalist id="source-list">
              {SOURCES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field
            id="referred-by"
            label="Referred by"
            maxLength={120}
            autoComplete="name"
            placeholder="Name (optional)"
            {...form.bind("referredBy")}
          />
          <Field
            id="location"
            label="Location"
            maxLength={120}
            autoComplete="address-level2"
            placeholder="City, region or remote"
            {...form.bind("location")}
          />
          <Field as="select" id="work-mode" label="Work mode" options={WORK_MODES} {...form.bind("workMode")} />
          <Field as="select" id="employment" label="Employment type" options={EMPLOYMENT_TYPES} {...form.bind("employmentType")} />
        </FieldGrid>
      </Panel.Body>
    </Panel>
  );
}
