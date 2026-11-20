import { api } from "@/lib/api";

const post = (url, body) => api.post(url, body).then(({ data }) => data); // { affected, ids }

export const archiveJobs = (ids) => post("/jobs/bulk/archive", { ids });
export const unarchiveJobs = (ids) => post("/jobs/bulk/unarchive", { ids });
export const trashJobs = (ids) => post("/jobs/bulk/delete", { ids });
export const restoreJobs = (ids) => post("/jobs/bulk/restore", { ids });

export const moveJobs = (ids, stage, { reason, note } = {}) =>
  post("/jobs/bulk/move", { ids, stage, closedReason: reason, closingNote: note });