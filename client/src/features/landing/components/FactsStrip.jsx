import Container from "@/features/landing/components/shared/Container";
import { FACTS } from "@/features/landing/data/landingContent";

export default function FactsStrip() {
  return (
    <section aria-label="At a glance" className="border-y border-rule bg-surface">
      <Container>
        <ul className="grid grid-cols-2 md:grid-cols-4">
          {FACTS.map(({ value, label }) => (
            <li
              key={value}
              className="border-t border-rule py-[18px] max-md:nth-[-n+2]:border-t-0 max-md:even:border-l max-md:even:pl-5 md:border-t-0 md:border-l md:px-6 md:py-[22px] md:first:border-l-0 md:first:pl-0"
            >
              <strong className="block font-serif text-[28px] leading-[1.1] font-normal tracking-[-0.01em]">
                {value}
              </strong>
              <span className="text-[13.5px] text-muted">{label}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}