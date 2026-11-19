import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBoardJobs, moveJobStage } from "../api/boardApi";

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
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [jobs, setJobs] = useState([]);
  const [lastMove, setLastMove] = useState(null); // drives the Undo toast
  const [moveError, setMoveError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  // Source of truth between renders, so two quick moves never read stale state.
  const jobsRef = useRef([]);

  const commit = useCallback((next) => {
    jobsRef.current = next;
    setJobs(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetchBoardJobs({ preview })
      .then((data) => {
        if (cancelled) return;
        commit(data);
        setStatus("success");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [preview, attempt, commit]);

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
    (id, stage, { beforeId, silent = false, restore } = {}) => {
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
      setMoveError(null);
      setLastMove(
        silent || sameStage
          ? null
          : { key: Date.now(), id, title: job.title, from: previous.stage, to: stage, previous },
      );

      moveJobStage(id, { stage, position }).catch(() => {
        // Only roll back if the card is still where we put it.
        const now = jobsRef.current.find((j) => j.id === id);
        if (!now || now.stage !== stage || now.position !== position) return;
        patchJob(id, previous);
        setLastMove(null);
        setMoveError(`Couldn't move ${job.title}. It was put back.`);
      });
    },
    [patchJob],
  );

  const undoMove = useCallback(() => {
    if (!lastMove) return;
    moveJob(lastMove.id, lastMove.from, { silent: true, restore: lastMove.previous });
    setLastMove(null);
  }, [lastMove, moveJob]);

  const clearNotice = useCallback(() => {
    setLastMove(null);
    setMoveError(null);
  }, []);

  // UI only for now: removes cards from local state. A refresh brings them back.
  const dropJobs = useCallback(
    (ids) => {
      commit(jobsRef.current.filter((j) => !ids.includes(j.id)));
      setLastMove(null);
      setMoveError(null);
    },
    [commit],
  );

  const archive = dropJobs;
  const remove = dropJobs;

  return { status, jobs, retry, moveJob, undoMove, lastMove, moveError, clearNotice, archive, remove };
}
