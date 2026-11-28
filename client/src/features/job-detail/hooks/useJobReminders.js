import { useCallback, useEffect, useRef, useState } from "react";
import useToast from "@/hooks/useToast";
import { api, getApiError } from "../../../lib/api";

// Loads a job's reminders while the Reminders tab is open. Each action returns true on success.
export default function useJobReminders(jobId, active, onCountChange) {
  const { show } = useToast();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [items, setItems] = useState([]);
  const [attempt, setAttempt] = useState(0);
  const itemsRef = useRef([]);
  const loaded = useRef(false);
  const countRef = useRef(onCountChange);

  useEffect(() => {
    countRef.current = onCountChange;
  });

  const commit = useCallback((next) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  // Refetches each time the tab opens, because interview changes add and move auto reminders.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    if (!loaded.current) setStatus("loading");
    api
      .get(`/jobs/${jobId}/reminders`)
      .then(({ data }) => {
        if (cancelled) return;
        commit(data.reminders);
        countRef.current?.("reminders", data.reminders.length);
        loaded.current = true;
        setStatus("success");
      })
      .catch(() => {
        if (!cancelled && !loaded.current) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [jobId, active, attempt, commit]);

  const run = async (request, onDone, message) => {
    try {
      const { data } = await request();
      onDone(data);
      countRef.current?.("reminders", data.remindersCount);
      show(message, { duration: 3000 });
      return true;
    } catch (err) {
      show(getApiError(err).message);
      return false;
    }
  };

  const base = `/jobs/${jobId}/reminders`;
  const replace = ({ reminder }) => commit(itemsRef.current.map((r) => (r.id === reminder.id ? reminder : r)));
  const drop = (reminderId) => () => commit(itemsRef.current.filter((r) => r.id !== String(reminderId)));

  const add = (data) =>
    run(() => api.post(base, data), ({ reminder }) => commit([reminder, ...itemsRef.current]), "Reminder added.");
  const edit = (reminderId, data) => run(() => api.patch(`${base}/${reminderId}`, data), replace, "Reminder updated.");
  const complete = (reminderId, done) =>
    run(
      () => api.patch(`${base}/${reminderId}/status`, { status: done ? "done" : "pending" }),
      replace,
      done ? "Reminder completed." : "Reminder reopened.",
    );
  // Same endpoint: the server deletes manual reminders and dismisses auto ones.
  const dismiss = (reminderId) => run(() => api.delete(`${base}/${reminderId}`), drop(reminderId), "Reminder dismissed.");
  const remove = (reminderId) => run(() => api.delete(`${base}/${reminderId}`), drop(reminderId), "Reminder deleted.");

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { status, items, retry, add, edit, complete, dismiss, remove };
}