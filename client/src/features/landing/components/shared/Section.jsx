import cx from "../../../../lib/cx";
import Container from "./Container";

export default function Section({ id, labelledBy, className = "", containerClassName = "", children }) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cx("scroll-mt-[72px] py-[clamp(56px,8vw,104px)]", className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}