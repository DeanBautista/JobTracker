export const GOAL_MIN = 1;
export const GOAL_MAX = 100;
export const GOAL_PRESETS = [3, 5, 10];
export const GOAL_DEFAULT = 5;

export function validateGoal(value) {
  const n = Number(value);
  const valid = value !== "" && Number.isInteger(n) && n >= GOAL_MIN && n <= GOAL_MAX;
  return valid ? null : "Enter a number from 1 to 100.";
}

export function validateJob({ title, company }) {
  const errors = {};
  if (!title.trim()) errors.title = "Enter a job title.";
  if (!company.trim()) errors.company = "Enter a company name.";
  return errors;
}
