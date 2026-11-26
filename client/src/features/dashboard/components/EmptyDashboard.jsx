export default function EmptyDashboard({ onAddJob }) {
  return (
    <section
      aria-labelledby="empty-title"
      className="animate-rise rounded-lg border border-dashed border-muted bg-surface px-6 py-14 text-center"
    >
      <h2
        id="empty-title"
        className="font-serif text-[1.8rem] leading-[1.15] font-normal tracking-[-0.015em]"
      >
        Your dashboard is empty
      </h2>
      <p className="mx-auto mt-3 mb-6 max-w-[46ch] text-muted">
        Add your first job and this page will show your funnel, response rate, weekly goal and
        which resume gets replies.
      </p>
      <button type="button" className="btn btn-primary" onClick={onAddJob}>
        Add your first job
      </button>
    </section>
  );
}
