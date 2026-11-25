import Button from "@/components/Button";
import Reveal from "@/components/Reveal";
import Section from "@/features/landing/components/shared/Section";
import { sectionTitleClass } from "@/features/landing/components/shared/SectionIntro";

export default function ClosingSection() {
  return (
    <Section labelledBy="closing-title" className="border-t border-rule bg-surface text-center">
      <Reveal as="h2" id="closing-title" className={sectionTitleClass}>
        Add your first job today
      </Reveal>
      <Reveal as="p" index={1} className="mx-auto mt-3 mb-7 max-w-[40ch] text-muted">
        Free to use. Setup takes about a minute.
      </Reveal>
      <Reveal index={2}>
        <Button as="a" href="#signup" variant="primary">
          Create free account
        </Button>
      </Reveal>
    </Section>
  );
}