import { useCallback, useEffect, useState } from "react";
import { useJobsVersion } from "@/features/jobs/utils/jobsSync";
import fetchTrashed from "../api/fetchTrashed";

const EMPTY = { key: null, jobs: [], total: 0, counts: { archive: null, trash: null }, failed: false };

// Loads one tab of the page, with both tab totals for the count badges.
export default function useTrashList({ view, page, size }) {
  const [data, setData] = useState(EMPTY);
  const [attempt, setAttempt] = useState(0);
  // Bumps whenever jobs change anywhere in the app (including a toast Undo from another page).
  const syncVersion = useJobsVersion();
  const key = `${view}:${page}:${size}`;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetchTrashed({ view, page, size }, { signal })
      .then((res) =>
        setData({
          key,
          jobs: res.jobs ?? [],
          total: res.total ?? 0,
          counts: res.counts ?? EMPTY.counts,
          failed: false,
        }),
      )
      .catch(() => {
        if (!signal.aborted) setData((prev) => ({ ...prev, key, jobs: [], total: 0, failed: true }));
      });

    return () => controller.abort();
  }, [key, syncVersion, attempt, view, page, size]);

  const retry = useCallback(() => {
    setData(EMPTY);
    setAttempt((n) => n + 1);
  }, []);

  // Refetches keep showing the old rows until the new ones arrive, so there is no flicker.
  const status = data.key !== key ? "loading" : data.failed ? "error" : "success";

  return { status, jobs: data.jobs, total: data.total, counts: data.counts, retry };
}