import { useCallback, useEffect, useState } from "react";
import { fetchFunnel } from "../api/dashboardApi";

export default function useFunnel(range) {
  const [state, setState] = useState({ status: "loading", steps: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    setState((prev) => ({ ...prev, status: "loading" }));

    fetchFunnel(range)
      .then((data) => !ignore && setState({ status: "success", steps: data.steps }))
      .catch(() => !ignore && setState({ status: "error", steps: [] }));

    return () => {
      ignore = true;
    };
  }, [range, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}