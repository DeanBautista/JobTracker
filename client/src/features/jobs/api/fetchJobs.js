import { api } from "@/lib/api";

// Returns { jobs, total }. Empty filters are left out of the query string.
export default async function fetchJobs(params, { signal } = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );
  const { data } = await api.get("/jobs", { params: clean, signal });
  return data;
}