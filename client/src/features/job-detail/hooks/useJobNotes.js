import { useCallback, useEffect, useRef, useState } from "react";
import useToast from "@/hooks/useToast";
import { api, getApiError } from "../../../lib/api";

// Loads a job's notes and owns add / edit / pin / delete. Each action returns true on success.
export default function useJobNotes(jobId, onCountChange) {
  const { show } = useToast();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [notes, setNotes] = useState([]);
  const [attempt, setAttempt] = useState(0);
  const notesRef = useRef([]);
  const countRef = useRef(onCountChange);

  useEffect(() => {
    countRef.current = onCountChange;
  });

  // Keeps the tab badge in step with the list.
  const commit = useCallback((next) => {
    notesRef.current = next;
    setNotes(next);
    countRef.current?.("notes", next.length);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    api
      .get(`/jobs/${jobId}/notes`)
      .then(({ data }) => {
        if (cancelled) return;
        commit(data.notes);
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
      show(message, { duration: 3000 });
      return true;
    } catch (err) {
      show(getApiError(err).message);
      return false;
    }
  };

  const add = (text) =>
    run(() => api.post(`/jobs/${jobId}/notes`, { text }), (note) => commit([note, ...notesRef.current]), "Note added.");

  const edit = (noteId, patch) =>
    run(
      () => api.patch(`/jobs/${jobId}/notes/${noteId}`, patch),
      (note) => commit(notesRef.current.map((n) => (n.id === note.id ? note : n))),
      "Note updated.",
    );

  const togglePin = (noteId, pinned) => edit(noteId, { pinned });

  const remove = (noteId) =>
    run(
      () => api.delete(`/jobs/${jobId}/notes/${noteId}`),
      () => commit(notesRef.current.filter((n) => n.id !== String(noteId))),
      "Note deleted.",
    );

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { status, notes, retry, add, edit, togglePin, remove };
}