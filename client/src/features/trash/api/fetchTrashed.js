import { api } from "@/lib/api";

// Returns { jobs, total, counts: { archive, trash } } for one tab.
export default async function fetchTrashed({ view, page, size }, { signal } = {}) {
  const { data } = await api.get("/jobs", { params: { view, page, size }, signal });
  return data;
}