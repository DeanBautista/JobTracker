import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function useJobTimeline(jobId) {
  const [state, setState] = useState({ status: "loading", events: [] }); // loading | success | error
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", events: [] });
    api
      .get(`/jobs/${jobId}/timeline`)
      .then(({ data }) => {
        if (!cancelled) setState({ status: "success", events: data.timeline });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", events: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [jobId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}