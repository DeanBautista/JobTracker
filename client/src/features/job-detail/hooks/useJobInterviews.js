import { useCallback, useEffect, useRef, useState } from "react";
import useToast from "@/hooks/useToast";
import { api, getApiError } from "../../../lib/api";

// Loads a job's interview rounds and owns add / edit / result / cancel. Each action returns true on success.
export default function useJobInterviews(jobId, onCountChange) {
  const { show } = useToast();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [rounds, setRounds] = useState([]);
  const [attempt, setAttempt] = useState(0);
  const roundsRef = useRef([]);
  const countRef = useRef(onCountChange);

  useEffect(() => {
    countRef.current = onCountChange;
  });

  const commit = useCallback((next) => {
    roundsRef.current = next;
    setRounds(next);
    countRef.current?.("interviews", next.length);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    api
      .get(`/jobs/${jobId}/interviews`)
      .then(({ data }) => {
        if (cancelled) return;
        commit(data.interviews);
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [jobId, attempt, commit]);

  const run = async (request, onDone, message) => {
    try {
      const { data } = await request();
      onDone(data);
      // The server adds, moves or removes the auto reminders, so keep that badge in step too.
      if (data?.remindersCount !== undefined) countRef.current?.("reminders", data.remindersCount);
      show(message, { duration: 3000 });
      return true;
    } catch (err) {
      show(getApiError(err).message);
      return false;
    }
  };

  const replace = ({ round }) => commit(roundsRef.current.map((r) => (r.id === round.id ? round : r)));
  const base = `/jobs/${jobId}/interviews`;

  const add = (data) =>
    run(() => api.post(base, data), ({ round }) => commit([round, ...roundsRef.current]), "Interview round added.");
  const edit = (roundId, data) => run(() => api.patch(`${base}/${roundId}`, data), replace, "Interview round updated.");
  const saveResult = (roundId, data) =>
    run(() => api.patch(`${base}/${roundId}/result`, data), replace, "Result saved.");
  const cancel = (roundId) => run(() => api.patch(`${base}/${roundId}/cancel`), replace, "Interview round cancelled.");

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const remove = (roundId) =>
    run(
      () => api.delete(`${base}/${roundId}`),
      () => commit(roundsRef.current.filter((r) => r.id !== String(roundId))),
      "Interview round deleted.",
    );

  return { status, rounds, retry, add, edit, saveResult, cancel, remove };
}