import { useCallback, useEffect, useState } from "react";
import { fetchWeekly } from "../api/dashboardApi";

export default function useWeekly() {
  const [state, setState] = useState({ status: "loading", goal: 5, counts: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    setState((prev) => ({ ...prev, status: "loading" }));

    fetchWeekly()
      .then((data) => !ignore && setState({ status: "success", ...data }))
      .catch(() => !ignore && setState((prev) => ({ ...prev, status: "error" })));

    return () => {
      ignore = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}