export const OPEN_STAGES = [
  { value: "wishlist", label: "Wishlist" },
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
];

export const CLOSED_STAGES = [
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "ghosted", label: "Ghosted" },
];

export const MODES = [
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

export const PRIORITIES = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const SOURCES = ["LinkedIn", "Indeed", "Company site", "Referral", "Recruiter", "Other"];

export const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "Full time" },
  { value: "part-time", label: "Part time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

export const PAY_PERIODS = [
  { value: "month", label: "Per month" },
  { value: "year", label: "Per year" },
  { value: "hour", label: "Per hour" },
  { value: "one-time", label: "One-time" },
];

export const CURRENCIES = ["PHP", "USD", "SGD", "EUR", "GBP"];

export const DATE_RANGES = [
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

export const PAGE_SIZES = [10, 25, 50];

export const TOGGLE_COLUMNS = [
  { key: "priority", label: "Priority" },
  { key: "mode", label: "Work mode" },
  { key: "source", label: "Source" },
  { key: "applied", label: "Date applied" },
  { key: "deadline", label: "Deadline" },
  { key: "days", label: "Days in stage" },
  { key: "reminder", label: "Reminder" },
];

export const DEFAULT_VISIBLE_COLUMNS = Object.fromEntries(
  TOGGLE_COLUMNS.map(({ key }) => [key, true]),
);

export const SORT_LABELS = {
  title: "job",
  company: "company",
  stage: "stage",
  priority: "priority",
  applied: "date applied",
  days: "days in stage",
};

export const FILTER_KEYS = ["q", "stage", "mode", "priority", "source", "date", "archived"];

export const FILTER_LABELS = {
  q: "Search",
  stage: "Stage",
  mode: "Work mode",
  priority: "Priority",
  source: "Source",
  date: "Date applied",
  archived: "Archived",
};

const ALL_OPTIONS = [
  ...OPEN_STAGES,
  { value: "closed", label: "Any closed" },
  ...CLOSED_STAGES,
  ...MODES,
  ...PRIORITIES,
];

export const optionLabel = (value) =>
  ALL_OPTIONS.find((option) => option.value === value)?.label ?? value;

export function filterValueLabel(key, value) {
  if (key === "date") return `Last ${value} days`;
  if (key === "archived") return "Shown";
  return optionLabel(value);
}