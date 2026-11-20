// Stage and close-reason data lives in the jobs feature. Re-exported so board imports keep working.
export {
  ALL_STAGES, CLOSED_STAGES, CLOSE_REASONS, OPEN_STAGES, REASON_STAGES, STAGE_LABELS, isClosedStage,
} from "@/features/jobs";

export const WORK_MODES = [
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

export const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const MODE_LABELS = Object.fromEntries(WORK_MODES.map((m) => [m.value, m.label]));
export const PRIORITY_LABELS = Object.fromEntries(PRIORITIES.map((p) => [p.value, p.label]));