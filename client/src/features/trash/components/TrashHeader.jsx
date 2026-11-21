import SegmentedControl from "@/components/SegmentedControl";

const DESCRIPTIONS = {
  archive: "Archived jobs are hidden from your board and list but still count on your dashboard.",
  trash: "Jobs stay here for 30 days, then they are removed for good.",
};

function TabLabel({ text, count }) {
  return (
    <>
      {text}
      {count != null && (
        <span className="ml-2 rounded-full bg-current/15 px-[7px] py-px font-mono text-[11px] leading-[1.4] font-medium">
          {count}
        </span>
      )}
    </>
  );
}

export default function TrashHeader({ view, counts, onViewChange }) {
  const options = [
    { value: "archive", label: <TabLabel text="Archive" count={counts.archive} /> },
    { value: "trash", label: <TabLabel text="Trash" count={counts.trash} /> },
  ];

  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div>
        <h1 className="font-serif text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.1] font-normal tracking-[-0.02em]">
          Archive &amp; Trash
        </h1>
        <p className="mt-1.5 max-w-[62ch] text-muted">{DESCRIPTIONS[view]}</p>
      </div>

      <SegmentedControl name="view" legend="View" hideLegend options={options} value={view} onChange={onViewChange} />
    </div>
  );
}