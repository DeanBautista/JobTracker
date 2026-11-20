import { useCallback, useContext, useEffect, useState } from "react";
import fetchJobs from "../api/fetchJobs";
import AddJobContext from "../context/AddJobContext";
import { notifyJobsChanged, useJobsVersion } from "../utils/jobsSync";

export default function useJobs({ filters, sort, dir, page, size }) {
  // Bumps every time a job is added, which reloads the list.
  const jobsVersion = useContext(AddJobContext)?.jobsVersion ?? 0;
  const syncVersion = useJobsVersion();
  const [state, setState] = useState({ status: "loading", jobs: [], total: 0 });
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, status: "loading" }));
    setAttempt((n) => n + 1);
  }, []);

  // A string key, so the effect reruns only when the query really changes.
  const key = JSON.stringify({ ...filters, sort, dir, page, size });

  useEffect(() => {
    const controller = new AbortController();

    fetchJobs(JSON.parse(key), { signal: controller.signal })
      .then(({ jobs, total }) => setState({ status: "success", jobs, total }))
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return; // a newer request replaced this one
        setState((prev) => ({ ...prev, status: "error" }));
      });

    return () => controller.abort();
  }, [key, jobsVersion, syncVersion, attempt]);

  return { ...state, retry, reload: notifyJobsChanged };
}