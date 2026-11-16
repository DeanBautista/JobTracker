import OnboardingHeader from "../components/OnboardingHeader";
import StepIndicator from "../components/StepIndicator";
import StepGoal from "../components/StepGoal";
import StepFirstJob from "../components/StepFirstJob";
import { useOnboardingForm } from "../hooks/useOnboardingForm";

export default function OnboardingPage() {
  const form = useOnboardingForm();

  return (
    <div data-state={form.state} className="flex min-h-screen flex-col">
      <OnboardingHeader onSkip={form.skipJob} disabled={form.submitting} />
      <main className="mx-auto w-[min(100%-2*var(--spacing-gutter),520px)] py-[clamp(32px,6vw,64px)]">
        <StepIndicator step={form.step} />
        {form.step === 1 ? (
          <StepGoal values={form.values} errors={form.errors} setValue={form.setValue} onSubmit={form.submitGoal} />
        ) : (
          <StepFirstJob
            values={form.values}
            errors={form.errors}
            submitting={form.submitting}
            setValue={form.setValue}
            onSubmit={form.submitJob}
            onSkip={form.skipJob}
            onBack={form.goBack}
          />
        )}
      </main>
    </div>
  );
}