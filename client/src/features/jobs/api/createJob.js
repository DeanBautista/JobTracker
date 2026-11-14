import { api } from "@/lib/api";

export default async function createJob(values, { confirmDuplicate = false } = {}) {
  try {
    const { data } = await api.post("/jobs", { ...values, confirmDuplicate });
    return { job: data };
  } catch (error) {
    const { status, data } = error.response ?? {};
    if (status === 422) return { errors: data.errors };
    if (status === 409) return { duplicate: data.duplicate };
    throw new Error(data?.message || "Could not save the job. Try again.", {
      cause: error,
    });
  }
}