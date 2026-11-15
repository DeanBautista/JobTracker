import { useContext, useEffect, useState } from "react";
import fetchJobs from "../api/fetchJobs";
import AddJobContext from "../context/AddJobContext";

export default function useJobs({ filters, sort, dir, page, size }) {
  // Bumps every time a job is added, which reloads the list.
  const jobsVersion = useContext(AddJobContext)?.jobsVersion ?? 0;
  const [state, setState] = useState({ status: "loading", jobs: [], total: 0 });

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
  }, [key, jobsVersion]);

  return state; // { status, jobs, total }
}