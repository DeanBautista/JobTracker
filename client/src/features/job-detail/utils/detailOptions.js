// Option lists and stage groups for the job detail page.
// Shared lists live in the jobs feature; this file only adds detail-specific ones.
import {
  CLOSED_STAGES as CLOSED_STAGE_OPTIONS,
  CURRENCIES,
  EMPLOYMENT_TYPES,
  MODES as WORK_MODES,
  OPEN_STAGES,
  PAY_PERIODS,
  PRIORITIES as PRIORITIES_HIGH_FIRST,
  SOURCES,
} from "@/features/jobs";

export { CURRENCIES, EMPLOYMENT_TYPES, PAY_PERIODS, SOURCES, WORK_MODES };

export const STAGES = [...OPEN_STAGES, ...CLOSED_STAGE_OPTIONS];
export const STAGE_LABELS = Object.fromEntries(STAGES.map((s) => [s.value, s.label]));
export const OFFER_STAGES = ["offer", "accepted"]; // show the Offer panel
export const CLOSED_STAGES = CLOSED_STAGE_OPTIONS.map((s) => s.value); // show the Closed panel
export const PREVIOUS_STAGES = OPEN_STAGES; // "Stage it was in"

export const PRIORITIES = [...PRIORITIES_HIGH_FIRST].reverse(); // low → high
export const CLOSE_REASONS = [
  { value: "not_enough_experience", label: "Not enough experience" },
  { value: "position_closed", label: "Position closed" },
  { value: "salary_mismatch", label: "Salary mismatch" },
  { value: "took_another_offer", label: "Took another offer" },
  { value: "no_response", label: "No response" },
  { value: "other", label: "Other" },
];

export const DOCUMENT_TYPES = [
  { value: "resume", label: "Resume" },
  { value: "cover-letter", label: "Cover letter" },
  { value: "portfolio", label: "Portfolio" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" },
];
export const DOCUMENT_USAGES = [
  { value: "attachment", label: "Attachment only" },
  { value: "sent-resume", label: "Sent resume" },
  { value: "sent-cover-letter", label: "Sent cover letter" },
];
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_FILE_EXTENSIONS = ["pdf", "doc", "docx"];

export const INTERVIEW_DURATIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "90", label: "90 minutes" },
  { value: "120", label: "2 hours" },
];
export const INTERVIEW_MODES = [
  { value: "video", label: "Video call" },
  { value: "phone", label: "Phone call" },
  { value: "onsite", label: "Onsite" },
];
export const INTERVIEW_MODE_LABELS = Object.fromEntries(INTERVIEW_MODES.map((m) => [m.value, m.label]));
export const INTERVIEW_OUTCOMES = [
  { value: "passed", label: "Passed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Not selected" },
  { value: "cancelled", label: "Cancelled" },
];
export const INTERVIEW_OUTCOME_LABELS = Object.fromEntries(INTERVIEW_OUTCOMES.map((o) => [o.value, o.label]));

export const REMINDER_ORIGINS = [
  { value: "manual", label: "Added manually" },
  { value: "interview", label: "Interview" },
  { value: "deadline", label: "Job deadline" },
  { value: "follow-up", label: "Follow-up" },
  { value: "offer", label: "Offer" },
];
export const REMINDER_ORIGIN_LABELS = Object.fromEntries(REMINDER_ORIGINS.map((o) => [o.value, o.label]));

// `countKey` points at an array on the job; the tab shows its length.
export const JOB_TABS = [
  { key: "overview", label: "Overview" },
  { key: "notes", label: "Notes", countKey: "notes" },
  { key: "timeline", label: "Timeline" },
  { key: "documents", label: "Documents", countKey: "documents" },
  { key: "interviews", label: "Interviews", countKey: "interviews" },
  { key: "reminders", label: "Reminders", countKey: "reminders" },
];
