import SignupCard from "./SignupCard";
import Reveal from "@/components/Reveal";
import Section from "@/features/landing/components/shared/Section";
import { NEXT_STEPS } from "@/features/landing/data/landingContent";

export default function SignupSection() {
  return (
    <Section
      id="signup"
      labelledBy="signup-title"
      className="bg-ink text-on-ink"
      containerClassName="grid items-center gap-[clamp(32px,6vw,96px)] md:grid-cols-[minmax(0,1fr)_minmax(0,440px)]"
    >
      <div>
        <Reveal>
          <span className="label text-on-ink/65">Get started</span>
          <h2
            id="signup-title"
            className="mt-3.5 font-serif text-[length:clamp(2rem,4vw,3.1rem)] leading-[1.08] font-normal tracking-[-0.02em]"
          >
            Start tracking in a minute
          </h2>
          <p className="mt-4 max-w-[42ch] text-[17px] text-on-ink/80">
            Create an account, set a weekly application goal, and add your first job.
          </p>
          <ol aria-label="What happens next" className="mt-8 grid gap-3.5">
            {NEXT_STEPS.map((step, i) => (
              <li key={step} className="flex items-baseline gap-3.5 text-[15px]">
                <span className="flex-none font-mono text-xs leading-none font-medium text-accent-on-ink">0{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <SignupCard />
    </Section>
  );
}