import { useCallback, useEffect, useRef, useState } from "react";
import { getMockJob } from "../utils/mockJobDetail";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Loads one job and owns autosave state.
 *   status:     "loading" | "success" | "not-found" | "error"
 *   saveStatus: "saved" | "saving" | "error"
 * Replace the two mock calls (marked TODO) with real API requests.
 */
export default function useJobDetail(jobId) {
  const [state, setState] = useState({ status: "loading", job: null });
  const [saveStatus, setSaveStatus] = useState("saved");
  const [reloadKey, setReloadKey] = useState(0);
  const lastPatch = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", job: null });
    setSaveStatus("saved");

    (async () => {
      await wait(400); // TODO: const job = await api.get(`/jobs/${jobId}`)
      if (cancelled) return;
      if (jobId === "error") return setState({ status: "error", job: null });
      const job = getMockJob(jobId);
      setState(job ? { status: "success", job } : { status: "not-found", job: null });
    })();

    return () => {
      cancelled = true;
    };
  }, [jobId, reloadKey]);

  const saveJob = useCallback(async (patch) => {
    lastPatch.current = patch;
    setSaveStatus("saving");
    try {
      await wait(500); // TODO: await api.patch(`/jobs/${jobId}`, patch)
      setState((prev) => ({ ...prev, job: { ...prev.job, ...patch } }));
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, []);

  const retrySave = useCallback(() => {
    if (lastPatch.current) saveJob(lastPatch.current);
  }, [saveJob]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { ...state, saveStatus, saveJob, retrySave, reload };
}
