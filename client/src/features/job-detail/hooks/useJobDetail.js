import { useCallback, useEffect, useRef, useState } from "react";
import useToast from "@/hooks/useToast";
import { api, getApiError } from "@/lib/api";

/**
 * Loads one job and owns save requests.
 *   status:     "loading" | "success" | "not-found" | "error"
 *   saveStatus: "saved" | "saving" | "error"
 *   saveJob resolves to { ok: true, job }, { ok: false },
 *   or null if a different job has since been loaded.
 */
export default function useJobDetail(jobId) {
  const { show } = useToast();
  const [state, setState] = useState({ status: "loading", job: null });
  const [saveStatus, setSaveStatus] = useState("saved");
  const [reloadKey, setReloadKey] = useState(0);
  const session = useRef({ queue: Promise.resolve(), pending: 0 });

  useEffect(() => {
    let cancelled = false;
    session.current = { queue: Promise.resolve(), pending: 0 };
    setState({ status: "loading", job: null });
    setSaveStatus("saved");

    (async () => {
      try {
        const { data } = await api.get(`/jobs/${jobId}`);
        if (cancelled) return;
        // Stopgap: tabs still read these arrays until their endpoints are wired.
        const job = { notes: [], documents: [], interviews: [], reminders: [], timeline: [], fileLibrary: [], ...data };
        setState({ status: "success", job });
      } catch (err) {
        if (cancelled) return;
        const code = err.response?.status;
        setState({ status: code === 404 || code === 422 ? "not-found" : "error", job: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [jobId, reloadKey]);

  const saveJob = useCallback(
    (patch) => {
      const current = session.current;
      current.pending += 1;
      setSaveStatus("saving");

      const finish = (result) => {
        current.pending -= 1;
        if (session.current !== current) return null;
        if (current.pending > 0) setSaveStatus("saving");
        else setSaveStatus(result.ok ? "saved" : "error");
        return result;
      };

      const request = current.queue.then(async () => {
        try {
          const { data } = await api.patch(`/jobs/${jobId}`, patch);
          const job = data.job ?? data;
          if (session.current === current) {
            setState((prev) => ({ ...prev, job: { ...prev.job, ...job } }));
          }
          show("Changes saved.", { duration: 3000 });
          return finish({ ok: true, job });
        } catch (err) {
          show(getApiError(err).message);
          return finish({ ok: false });
        }
      });

      current.queue = request;
      return request;
    },
    [jobId, show],
  );

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const patchJob = useCallback((partial) => {
    setState((prev) =>
      prev.job
        ? { ...prev, job: { ...prev.job, ...(typeof partial === "function" ? partial(prev.job) : partial) } }
        : prev,
    );
  }, []);

  return { ...state, saveStatus, saveJob, reload, patchJob };
}