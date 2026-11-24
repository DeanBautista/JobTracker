import RangePicker from "./RangePicker";

export default function DashboardHeader({
  firstName,
  range,
  onRangeChange,
  onAddJob,
  showControls = true,
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div>
        <h1 className="font-serif text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.1] font-normal tracking-[-0.02em]">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1.5 text-muted">Here is what needs attention today.</p>
      </div>

      {showControls && (
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <RangePicker value={range} onChange={onRangeChange} />
          <button type="button" className="btn btn-primary hidden sm:inline-flex" onClick={onAddJob}>
            + Add job
          </button>
        </div>
      )}
    </div>
  );
}
