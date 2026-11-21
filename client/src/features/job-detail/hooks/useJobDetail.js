import { useCallback, useEffect, useRef, useState } from "react";
import useToast from "@/hooks/useToast";
import { api, getApiError } from "@/lib/api";

/**
 * Loads one job and owns autosave state.
 *   status:     "loading" | "success" | "not-found" | "error"
 *   saveStatus: "saved" | "saving" | "error"
 * Replace the two mock calls (marked TODO) with real API requests.
 */
export default function useJobDetail(jobId) {
  const { show } = useToast();
  const [state, setState] = useState({ status: "loading", job: null });
  const [saveStatus, setSaveStatus] = useState("saved");
  const [reloadKey, setReloadKey] = useState(0);
  const lastPatch = useRef(null);

  useEffect(() => {
    let cancelled = false;
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
    async (patch) => {
      lastPatch.current = patch;
      setSaveStatus("saving");
      try {
        const { data } = await api.patch(`/jobs/${jobId}`, patch);
        setState((prev) => ({ ...prev, job: { ...prev.job, ...data } }));
        setSaveStatus("saved");
        show("Changes saved.", { duration: 3000 });
      } catch (err) {
        setSaveStatus("error");
        show(getApiError(err).message);
      }
    },
    [jobId, show],
  );

  const retrySave = useCallback(() => {
    if (lastPatch.current) saveJob(lastPatch.current);
  }, [saveJob]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const patchJob = useCallback((partial) => {
    setState((prev) =>
      prev.job
        ? { ...prev, job: { ...prev.job, ...(typeof partial === "function" ? partial(prev.job) : partial) } }
        : prev,
    );
  }, []);

  return { ...state, saveStatus, saveJob, retrySave, reload, patchJob };
}
