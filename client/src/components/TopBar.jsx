import { useAddJob } from "@/features/jobs";
import NotificationsPopover from "./NotificationsPopover";

export default function Topbar({ onMenuClick }) {
  const { openAddJob } = useAddJob();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-rule bg-paper/95 px-4 backdrop-blur-sm shell:px-7">
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex min-h-10 cursor-pointer items-center rounded-md border border-rule bg-surface px-3.5 text-sm shell:hidden"
      >
        Menu
      </button>

      <div className="flex-1" />

      <button
        type="button"
        onClick={openAddJob}
        aria-label="Add job"
        aria-haspopup="dialog"
        className="btn btn-primary"
      >
        <span aria-hidden="true">+</span>
        <span className="hidden sm:inline">Add job</span>
      </button>

      <NotificationsPopover />
    </header>
  );
}