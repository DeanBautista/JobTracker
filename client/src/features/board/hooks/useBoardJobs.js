import { useCallback, useContext, useEffect, useRef, useState } from "react";
import useToast from "@/hooks/useToast";
import { fetchBoardJobs, moveJobStage } from "../api/boardApi";
import { STAGE_LABELS } from "../utils/boardStages";
import AddJobContext from "@/features/jobs/context/AddJobContext"; // same file useJobs imports
import {
  archiveJobs, notifyJobsChanged, restoreJobs, trashJobs, unarchiveJobs, useJobsVersion,
} from "@/features/jobs";

const GAP = 1000;
const byPosition = (a, b) => a.position - b.position;

/**
 * Owns the board's jobs. Drag-and-drop, the "Move to" menu and Undo all go through
 * moveJob(), so persistence lives in exactly one place (moveJobStage in boardApi.js).
 *
 * moveJob is optimistic: the card moves immediately and is rolled back if the API rejects.
 *
 * Ordering: every job has a numeric `position` inside its stage. Dropping between two cards
 * gives the job the midpoint of their positions, so only that one job is written.
 */
export default function useBoardJobs({ preview } = {}) {
  const jobsVersion = useContext(AddJobContext)?.jobsVersion ?? 0;
  const syncVersion = useJobsVersion();
  const toast = useToast();
  const toastId = useRef(null); // the Undo toast of the latest move
  const moveJobRef = useRef(null); // lets the Undo button call moveJob without a self-reference
  const loadedRef = useRef(false); // true after the first successful load
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [jobs, setJobs] = useState([]);
  const [attempt, setAttempt] = useState(0);

  // Source of truth between renders, so two quick moves never read stale state.
  const jobsRef = useRef([]);

  const commit = useCallback((next) => {
    jobsRef.current = next;
    setJobs(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Only the first load (and retries) shows the skeleton. A refetch after adding a job
    // updates the board in place instead of flashing it.
    if (!loadedRef.current) setStatus("loading");

    fetchBoardJobs({ preview })
      .then((data) => {
        if (cancelled) return;
        commit(data);
        loadedRef.current = true;
        setStatus("success");
      })
      .catch(() => {
        // A failed background refetch keeps the cards you already have.
        if (!cancelled && !loadedRef.current) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [preview, attempt, jobsVersion, syncVersion, commit]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const patchJob = useCallback(
    (id, patch) => commit(jobsRef.current.map((j) => (j.id === id ? { ...j, ...patch } : j))),
    [commit],
  );

  /**
   * moveJob(id, stage, options)
   *   beforeId  undefined -> top of the column (what the "Move to" menu does)
   *             null      -> bottom of the column
   *             <jobId>   -> directly above that job
   *   silent    skip the Undo toast
   *   restore   { stage, stageEnteredAt, position } to put a job back exactly (Undo)
   */
  const moveJob = useCallback(
    (id, stage, { beforeId, silent = false, restore, closing } = {}) => {
      const job = jobsRef.current.find((j) => j.id === id);
      if (!job) return;
      if (beforeId === id) return;
      const sameStage = job.stage === stage;

      // Full (unfiltered) column without the moving job, in order.
      const others = jobsRef.current.filter((j) => j.stage === stage && j.id !== id).sort(byPosition);

      let position;
      if (restore) {
        position = restore.position;
      } else {
        const found = beforeId == null ? -1 : others.findIndex((j) => j.id === beforeId);
        const index = beforeId === null ? others.length : found === -1 ? 0 : found;
        const prev = others[index - 1];
        const next = others[index];

        if (sameStage) {
          // Dropped back where it already is: nothing to save.
          const current = jobsRef.current.filter((j) => j.stage === stage).sort(byPosition);
          const reordered = [...others.slice(0, index), job, ...others.slice(index)];
          if (current.every((j, i) => j.id === reordered[i].id)) return;
        }

        position =
          prev && next ? (prev.position + next.position) / 2
          : next ? next.position - GAP
          : prev ? prev.position + GAP
          : 0;
      }

      const previous = { stage: job.stage, stageEnteredAt: job.stageEnteredAt, position: job.position };
      patchJob(id, {
        stage,
        position,
        // Re-ordering inside a column is not a stage change, so the age keeps counting.
        stageEnteredAt: restore ? restore.stageEnteredAt : sameStage ? job.stageEnteredAt : new Date().toISOString(),
      });

      // A new move replaces the previous Undo, which would be stale now.
      if (toastId.current != null) toast.dismiss(toastId.current);
      toastId.current =
        silent || sameStage
          ? null
          : toast.show(`Moved ${job.title} to ${STAGE_LABELS[stage]}.`, {
              action: {
                label: "Undo",
                onClick: () => moveJobRef.current(id, previous.stage, { silent: true, restore: previous }),
              },
            });

      moveJobStage(id, { stage, position, closedReason: closing?.reason, closingNote: closing?.note })
        .then(() => {
          if (restore) notifyJobsChanged(); // an Undo may have been clicked on another page
        })
        .catch(() => {
          // Only roll back if the card is still where we put it.
          const now = jobsRef.current.find((j) => j.id === id);
          if (!now || now.stage !== stage || now.position !== position) return;
          patchJob(id, previous);
          toast.show(`Couldn't move ${job.title}. It was put back.`);
        });
    },
    [patchJob, toast],
  );

  useEffect(() => {
    moveJobRef.current = moveJob;
  }, [moveJob]);

  const dropJobs = useCallback(
    async (ids, { request, undo, done: verb, undone }) => {
      const removed = jobsRef.current.filter((j) => ids.includes(j.id));
      const label = removed.length === 1 ? removed[0].title : `${removed.length} jobs`;
      commit(jobsRef.current.filter((j) => !ids.includes(j.id)));
      if (toastId.current != null) toast.dismiss(toastId.current);
      toastId.current = null;

      try {
        const { ids: changed } = await request(ids);
        notifyJobsChanged(); // any mounted page (list or board) refetches
        if (changed.length === 0) {
          toast.show("Nothing changed. These jobs may have been updated elsewhere.");
          return;
        }
        toastId.current = toast.show(`${verb} ${label}.`, {
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                await undo(changed);
                notifyJobsChanged(); // not retry(): the board may not be mounted anymore
                toast.show(`${undone} ${label}.`);
              } catch {
                toast.show("Couldn't undo. Try again.");
              }
            },
          },
        });
      } catch {
        commit([...jobsRef.current, ...removed]);
        toast.show("Couldn't complete that. The cards were put back.");
      }
    },
    [commit, toast],
  );

  const archive = (ids) =>
    dropJobs(ids, { request: archiveJobs, undo: unarchiveJobs, done: "Archived", undone: "Unarchived" });

  const remove = (ids) =>
    dropJobs(ids, { request: trashJobs, undo: restoreJobs, done: "Moved to Trash:", undone: "Restored" });

  return { status, jobs, retry, moveJob, archive, remove };
}