import { api } from "@/lib/api";

// The auth header is why this can't be a plain <a href> download.
export default async function exportJobs(ids) {
  const { data } = await api.post("/jobs/bulk/export", { ids }, { responseType: "blob" });
  return new Blob([data], { type: "text/csv;charset=utf-8" });
}

// Same filters as the list, minus paging. Empty filters are left out of the query string.
export async function exportFilteredJobs(params) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );
  const { data } = await api.get("/jobs/export", { params: clean, responseType: "blob" });
  return new Blob([data], { type: "text/csv;charset=utf-8" });
}