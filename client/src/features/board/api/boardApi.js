import { MOCK_BOARD_JOBS } from "../utils/mockBoardJobs";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Dev switch: set mockControls.failMoves = true in the console to test the rollback path.
export const mockControls = { failMoves: false };

// TODO(api): GET /jobs?view=board  (all non-archived jobs, no pagination)
// `preview` lets you see loading/error/empty states from the URL: /board?preview=error
export async function fetchBoardJobs({ preview } = {}) {
  await wait(350);
  if (preview === "error") throw new Error("Could not load the board");
  if (preview === "empty") return [];
  return structuredClone(MOCK_BOARD_JOBS);
}

// TODO(api): PATCH /jobs/:id/move  { stage, position }
// One row changes per move, whether the card changed column or just moved up/down.
// useBoardJobs already updates the UI first and rolls back if this rejects.
export async function moveJobStage(id, { stage, position }) {
  await wait(150);
  if (mockControls.failMoves) throw new Error(`Could not move job ${id} to ${stage}`);
  console.info("move", id, stage, position);
}
