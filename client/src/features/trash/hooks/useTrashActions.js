import { useRef } from "react";
import useToast from "@/hooks/useToast";
import { getApiError } from "@/lib/api";
import * as jobApi from "@/features/jobs/api/jobActions";
import { notifyJobsChanged } from "@/features/jobs/utils/jobsSync";
import * as trashApi from "../api/trashActions";
import { plural } from "../utils/format";

export default function useTrashActions({ clearSelection }) {
  const toast = useToast();
  const busy = useRef(false);

  const undoWith = (fn, text) => async (ids) => {
    try {
      await fn(ids);
      notifyJobsChanged();
      toast.show(text(ids.length));
    } catch (error) {
      toast.show(getApiError(error).message);
    }
  };

  const run = async (task, successText, undoFn) => {
    if (busy.current) return;
    busy.current = true;
    try {
      const { ids } = await task();
      clearSelection();
      notifyJobsChanged();
      if (ids.length === 0) {
        toast.show("Nothing changed. These jobs may have been updated elsewhere.");
      } else {
        toast.show(successText(ids.length), undoFn ? { action: { label: "Undo", onClick: () => undoFn(ids) } } : {});
      }
    } catch (error) {
      toast.show(getApiError(error).message);
    } finally {
      busy.current = false;
    }
  };

  const unarchive = (ids) =>
    run(
      () => jobApi.unarchiveJobs(ids),
      (n) => `Unarchived ${plural(n)}`,
      undoWith(jobApi.archiveJobs, (n) => `Archived ${plural(n)} again`),
    );

  // "Delete" on the Archive tab moves jobs to Trash.
  const trash = (ids) =>
    run(
      () => jobApi.trashJobs(ids),
      (n) => `Moved ${plural(n)} to Trash`,
      undoWith(jobApi.restoreJobs, (n) => `Restored ${plural(n)}`),
    );

  const restore = (ids) =>
    run(
      () => jobApi.restoreJobs(ids),
      (n) => `Restored ${plural(n)}`,
      undoWith(jobApi.trashJobs, (n) => `Moved ${plural(n)} back to Trash`),
    );

  // Permanent, so no Undo.
  const purge = (ids) => run(() => trashApi.purgeJobs(ids), (n) => `Deleted ${plural(n)} forever`);

  return { unarchive, trash, restore, purge };
}