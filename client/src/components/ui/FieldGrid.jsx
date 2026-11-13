import cx from "../../lib/cx";

// Two columns from `sm` up, one below. Give a <Field full /> to span both.
export default function FieldGrid({ className, children }) {
  return <div className={cx("grid grid-cols-1 gap-x-3.5 gap-y-4 sm:grid-cols-2", className)}>{children}</div>;
}
