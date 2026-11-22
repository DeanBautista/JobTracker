export const FIELD_CLASS = "field w-full min-h-11";
export const TEXTAREA_CLASS = "field w-full min-h-35 resize-y px-3 py-2.5 leading-normal";

export const STAGE_OPTIONS = [
  { value: "wishlist", label: "Wishlist" },
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "ghosted", label: "Ghosted" },
];

// Stages that show extra fields in the Add job dialog.
export const CLOSING_STAGES = ["rejected", "withdrawn", "ghosted"]; // closing reason + note
export const OFFER_FIELD_STAGES = ["offer", "accepted"]; // offer details

export const CLOSE_REASON_OPTIONS = [
  { value: "not_enough_experience", label: "Not enough experience" },
  { value: "position_closed", label: "Position closed" },
  { value: "salary_mismatch", label: "Salary mismatch" },
  { value: "took_another_offer", label: "Took another offer" },
  { value: "no_response", label: "No response" },
  { value: "other", label: "Other" },
];

export const WORK_MODE_OPTIONS = [
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const SOURCE_SUGGESTIONS = ["LinkedIn", "Indeed", "Company site", "Referral", "Recruiter", "Other"];