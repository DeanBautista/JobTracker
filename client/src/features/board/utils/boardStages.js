// Board stages. If jobOptions.js already defines these, import from there instead
// and delete the duplicates. Values must match what your API stores.
export const OPEN_STAGES = [
  { value: "wishlist", label: "Wishlist" },
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
];

// Shown together in the collapsible "Closed" column.
export const CLOSED_STAGES = [
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "ghosted", label: "Ghosted" },
];

export const ALL_STAGES = [...OPEN_STAGES, ...CLOSED_STAGES];

export const STAGE_LABELS = Object.fromEntries(ALL_STAGES.map((s) => [s.value, s.label]));

const CLOSED_VALUES = new Set(CLOSED_STAGES.map((s) => s.value));
export const isClosedStage = (stage) => CLOSED_VALUES.has(stage);

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
