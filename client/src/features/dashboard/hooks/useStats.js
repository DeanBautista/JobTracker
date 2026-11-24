import { useCallback, useEffect, useState } from "react";
import { fetchStats } from "../api/dashboardApi";

export default function useStats(range) {
  const [state, setState] = useState({ status: "loading", data: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    setState((prev) => (prev.status === "error" ? { ...prev, status: "loading" } : prev));

    fetchStats(range)
      .then((data) => !ignore && setState({ status: "success", data }))
      .catch(() => !ignore && setState((prev) => ({ ...prev, status: "error" })));

    return () => {
      ignore = true;
    };
  }, [range, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}