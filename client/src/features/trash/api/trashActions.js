import { api } from "@/lib/api";

// Permanently removes jobs that are already in Trash. Resolves to { affected, ids }.
export async function purgeJobs(ids) {
  const { data } = await api.post("/jobs/bulk/delete-forever", { ids });
  return data;
}