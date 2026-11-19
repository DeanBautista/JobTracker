import { api } from "@/lib/api"; // adjust to your axios instance file

// Dev switch: set mockControls.failMoves = true in the console to test the rollback path.
export const mockControls = { failMoves: false };

// `preview` lets you see error/empty states from the URL: /board?preview=error
export async function fetchBoardJobs({ preview } = {}) {
  if (preview === "error") throw new Error("Could not load the board");
  if (preview === "empty") return [];
  const { data } = await api.get("/jobs", { params: { view: "board" } });
  return data.jobs;
}

// One row changes per move, whether the card changed column or just moved up/down.
// useBoardJobs already updates the UI first and rolls back if this rejects.
export async function moveJobStage(id, { stage, position, closedReason, closingNote }) {
  if (mockControls.failMoves) throw new Error(`Could not move job ${id} to ${stage}`);
  await api.patch(`/jobs/${id}/move`, { stage, position, closedReason, closingNote });
}