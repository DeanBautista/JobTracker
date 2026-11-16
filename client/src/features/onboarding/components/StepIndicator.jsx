export default function StepIndicator({ step, total = 2 }) {
  return (
    <div className="mb-7">
      <p className="label">
        Step {step} of {total}
      </p>
      <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-[3px] flex-1 rounded-sm ${i < step ? "bg-accent" : "bg-rule"}`} />
        ))}
      </div>
    </div>
  );
}
