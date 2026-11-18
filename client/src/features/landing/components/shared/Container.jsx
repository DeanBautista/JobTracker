import cx from "../../../../lib/cx";

// Centers content using the .wrap class from index.css
export default function Container({ className = "", ...props }) {
  return <div className={cx("wrap", className)} {...props} />;
}