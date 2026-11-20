import JobMenu from "../shared/JobMenu";

export default function RowMenu({ job, actions }) {
  return (
    <JobMenu
      job={job}
      openHref={`/jobs/${job.id}`}
      triggerClassName="size-[34px]"
      onMove={(id, stage) => actions.moveStage([id], stage)}
      onArchive={actions.archive}
      onDelete={actions.remove}
    />
  );
}