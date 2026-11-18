import Section from "@/features/landing/components/shared/Section";
import SectionIntro from "@/features/landing/components/shared/SectionIntro";
import { STEPS } from "@/features/landing/data/landingContent";

export default function HowItWorksSection() {
  return (
    <Section id="how" labelledBy="how-title" className="border-y border-rule bg-surface">
      <SectionIntro
        id="how-title"
        label="How it works"
        title="From first listing to offer"
        description="Five steps, in the order you will use them."
      />

      <ol className="grid border-ink lg:grid-cols-5 lg:border-t">
        {STEPS.map(({ title, text }, i) => (
          <li
            key={title}
            className="grid grid-cols-[44px_1fr] gap-x-2 border-t border-rule py-5 first:border-ink lg:block lg:border-t-0 lg:border-l lg:pt-5 lg:pr-5 lg:pb-1 lg:pl-5 lg:first:border-l-0 lg:first:pl-0"
          >
            <span className="label mt-[3px] text-accent lg:mt-0 lg:mb-3.5 lg:block">0{i + 1}</span>
            <h3 className="col-start-2 font-serif text-[1.2rem] leading-[1.2] font-medium tracking-[-0.01em] lg:col-auto">
              {title}
            </h3>
            <p className="col-start-2 mt-2 text-[14.5px] text-muted lg:col-auto">{text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}