import Field from "../../../../components/ui/Field";
import FieldGrid from "../../../../components/ui/FieldGrid";
import Panel from "../../../../components/ui/Panel";
import { CURRENCIES, PAY_PERIODS } from "../../utils/detailOptions";

// Shown while the stage is Offer or Accepted.
export default function OfferPanel({ form }) {
  return (
    <Panel aria-labelledby="offer-heading">
      <Panel.Head id="offer-heading" title="Offer details" description="Track the terms and reply date" />
      <Panel.Body>
        <FieldGrid>
          <Field
            id="offer-salary"
            label="Offer salary"
            type="number"
            min={0}
            max={1_000_000_000}
            step={1000}
            inputMode="decimal"
            {...form.bind("offerSalary")}
          />
          <Field as="select" id="offer-currency" label="Currency" options={CURRENCIES} {...form.bind("offerCurrency")} />
          <Field as="select" id="offer-period" label="Period" options={PAY_PERIODS} {...form.bind("offerPeriod")} />
          <Field id="offer-reply-by" label="Reply by" type="date" {...form.bind("offerReplyBy")} />
          <Field as="textarea" id="offer-notes" label="Notes" full maxLength={3000} {...form.bind("offerNotes")} />
        </FieldGrid>
      </Panel.Body>
    </Panel>
  );
}
