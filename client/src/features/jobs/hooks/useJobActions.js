import { useRef, useState } from "react";
import useToast from "@/hooks/useToast";
import { getApiError } from "@/lib/api";
import * as api from "../api/jobActions";
import { REASON_STAGES, STAGE_LABELS } from "../utils/jobOptions";
import downloadFile from "@/lib/downloadFile";
import exportJobs, { exportFilteredJobs } from "../api/exportJobs";

const plural = (n) => `${n} job${n === 1 ? "" : "s"}`;

export default function useJobActions({ jobs, reload, clearSelection }) {
  const toast = useToast();
  const busy = useRef(false);
  const [pendingMove, setPendingMove] = useState(null); // { ids, stage } waiting for a close reason

  const undo = (fn, doneText) => async (ids) => {
    try {
      await fn(ids);
      reload();
      toast.show(doneText(ids.length));
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
      reload();
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

  const archive = (ids) =>
    run(() => api.archiveJobs(ids), (n) => `Archived ${plural(n)}`, undo(api.unarchiveJobs, (n) => `Unarchived ${plural(n)}`));

  const remove = (ids) =>
    run(() => api.trashJobs(ids), (n) => `Moved ${plural(n)} to Trash`, undo(api.restoreJobs, (n) => `Restored ${plural(n)}`));

  const sendMove = (ids, stage, details) => {
    // Remember where each job was, so Undo can put it back.
    const previous = new Map(jobs.filter((j) => ids.includes(j.id)).map((j) => [j.id, j.stage]));
    const subject = ids.length === 1 ? jobs.find((j) => j.id === ids[0])?.title : null;

    const moveBack = async (moved) => {
      const groups = {};
      for (const id of moved) (groups[previous.get(id)] ??= []).push(id);
      await Promise.all(Object.entries(groups).map(([from, group]) => api.moveJobs(group, from)));
    };

    return run(
      () => api.moveJobs(ids, stage, details),
      (n) => `Moved ${subject ?? plural(n)} to ${STAGE_LABELS[stage]}.`,
      undo(moveBack, (n) => `Moved ${plural(n)} back.`),
    );
  };

  const moveStage = (ids, stage) => {
    if (REASON_STAGES.includes(stage)) setPendingMove({ ids, stage });
    else sendMove(ids, stage);
  };

  const confirmMove = (details) => {
    const { ids, stage } = pendingMove;
    setPendingMove(null);
    sendMove(ids, stage, details);
  };

  const saveCsv = async (getBlob, count) => {
    if (busy.current) return;
    busy.current = true;
    try {
      downloadFile(await getBlob(), `jobs-${new Date().toLocaleDateString("en-CA")}.csv`); // en-CA = YYYY-MM-DD
      toast.show(`Exported ${plural(count)} to CSV.`);
    } catch {
      toast.show("Couldn't export. Try again.");
    } finally {
      busy.current = false;
    }
  };

  const exportSelection = (ids) => saveCsv(() => exportJobs(ids), ids.length);
  const exportFiltered = (params, count) => saveCsv(() => exportFilteredJobs(params), count);
  

  return {
    actions: { moveStage, archive, remove, exportSelection, exportFiltered },
    pendingMove,
    confirmMove,
    cancelMove: () => setPendingMove(null),
  };
}