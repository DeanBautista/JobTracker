import Section from "@/features/landing/components/shared/Section";
import SectionIntro from "@/features/landing/components/shared/SectionIntro";
import { FAQS } from "@/features/landing/data/landingContent";

export default function FaqSection() {
  return (
    <Section id="faq" labelledBy="faq-title">
      <SectionIntro id="faq-title" label="FAQ" title="Questions before you sign up" />

      <div className="max-w-[760px]">
        {FAQS.map(({ q, a }) => (
          <details key={q} name="faq" className="group border-t border-rule last:border-b">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-serif text-[1.15rem] leading-[1.3] font-medium after:flex-none after:font-mono after:text-[22px] after:leading-none after:font-normal after:text-muted after:content-['+'] group-open:after:content-['–'] [&::-webkit-details-marker]:hidden">
              {q}
            </summary>
            <p className="max-w-[60ch] pr-10 pb-[22px] text-muted">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}