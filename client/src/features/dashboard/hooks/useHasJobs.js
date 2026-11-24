import { useCallback, useEffect, useState } from "react";
import { fetchHasJobs } from "../api/dashboardApi";

// `version` changes whenever a job is added, which triggers a refetch.
export default function useHasJobs(version) {
  const [state, setState] = useState({ status: "loading", value: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    setState((prev) => (prev.status === "error" ? { ...prev, status: "loading" } : prev));

    fetchHasJobs()
      .then((data) => !ignore && setState({ status: "success", value: data.hasJobs }))
      .catch(() => !ignore && setState((prev) => ({ ...prev, status: "error" })));

    return () => {
      ignore = true;
    };
  }, [version, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}