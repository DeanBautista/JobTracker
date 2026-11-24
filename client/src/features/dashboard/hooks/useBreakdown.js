import { useCallback, useEffect, useState } from "react";
import { fetchBreakdown } from "../api/dashboardApi";

const EMPTY = { sources: [], rejections: { reasons: [], topStage: null } };

export default function useBreakdown(range) {
  const [state, setState] = useState({ status: "loading", ...EMPTY });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;
    setState((prev) => ({ ...prev, status: "loading" }));

    fetchBreakdown(range)
      .then((data) => !ignore && setState({ status: "success", ...data }))
      .catch(() => !ignore && setState({ status: "error", ...EMPTY }));

    return () => {
      ignore = true;
    };
  }, [range, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}