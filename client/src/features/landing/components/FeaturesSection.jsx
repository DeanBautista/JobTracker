import { DocumentRows, ScheduleRows, StageTrack, WeeklySpark } from "./FeaturePanels";
import Section from "@/features/landing/components/shared/Section";
import SectionIntro from "@/features/landing/components/shared/SectionIntro";
import Reveal from "@/components/Reveal";

const FEATURES = [
  {
    title: "Board and list",
    text: "Drag jobs between nine stages, or switch to the list and filter by work mode, priority and source. Export the list to CSV.",
    Panel: StageTrack,
  },
  {
    title: "The resume and letter you sent, per job",
    text: "See exactly which resume and cover letter went to each company and download them later, even after you have edited your master copy.",
    Panel: DocumentRows,
  },
  {
    title: "Interviews and reminders",
    text: "Log each round with its outcome. Reminders arrive in the app, with an optional morning email listing what is due.",
    Panel: ScheduleRows,
  },
  {
    title: "A dashboard that answers one question",
    text: "Is the search working? See the funnel, response rate, weekly goal and which resume gets replies.",
    Panel: WeeklySpark,
  },
];

export default function FeaturesSection() {
  return (
    <Section id="features" labelledBy="features-title">
      <SectionIntro
        id="features-title"
        label="Features"
        title="Four tools that share one job record"
        description="Everything you add to a job stays on that job, so you never hunt through folders and spreadsheets."
      />

      {FEATURES.map(({ title, text, Panel }, i) => (
        <Reveal 
          as="article"
          key={title}
          className="grid items-center gap-[clamp(24px,5vw,72px)] border-t border-rule py-9 last:border-b md:grid-cols-[minmax(0,4fr)_minmax(0,5fr)]"
        >
          <div className={i % 2 === 1 ? "md:order-2" : ""}>
            <span className="label mb-3 block">0{i + 1}</span>
            <h3 className="font-serif text-[length:clamp(1.4rem,2.4vw,1.8rem)] leading-[1.15] font-medium tracking-[-0.015em]">
              {title}
            </h3>
            <p className="mt-2.5 max-w-[46ch] text-muted">{text}</p>
          </div>
          <Panel />
        </Reveal>
      ))}
    </Section>
  );
}