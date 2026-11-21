const DAY_MS = 86_400_000;
export const RETENTION_DAYS = 30;

export const plural = (n) => `${n} job${n === 1 ? "" : "s"}`;

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function daysLeft(deletedAt) {
  const elapsed = Math.floor((Date.now() - new Date(deletedAt).getTime()) / DAY_MS);
  return Math.max(0, RETENTION_DAYS - elapsed);
}
