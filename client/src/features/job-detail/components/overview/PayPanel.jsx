import Field from "../../../../components/ui/Field";
import FieldGrid from "../../../../components/ui/FieldGrid";
import Panel from "../../../../components/ui/Panel";
import { CURRENCIES, PAY_PERIODS } from "../../utils/detailOptions";

const money = { type: "number", min: 0, max: 1_000_000_000, step: 1000, inputMode: "decimal" };

export default function PayPanel({ form }) {
  return (
    <Panel aria-labelledby="pay-heading">
      <Panel.Head
        id="pay-heading"
        title="Pay"
        description="Expected or listed compensation"
        aside={<span className="label">Optional</span>}
      />
      <Panel.Body>
        <FieldGrid>
          <Field id="salary-min" label="Salary min" {...money} {...form.bind("salaryMin")} />
          <Field id="salary-max" label="Salary max" {...money} {...form.bind("salaryMax")} />
          <Field as="select" id="pay-currency" label="Currency" options={CURRENCIES} {...form.bind("currency")} />
          <Field as="select" id="pay-period" label="Period" options={PAY_PERIODS} {...form.bind("salaryPeriod")} />
        </FieldGrid>
      </Panel.Body>
    </Panel>
  );
}
