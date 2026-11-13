// Date-only values ("2026-09-01") are formatted in UTC so they never shift a day.
// Date-times ("2026-10-16T14:00", no zone) are local wall-clock time.

const isDateOnly = (value) => value.length === 10;

export function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(isDateOnly(value) && { timeZone: "UTC" }),
  }).format(new Date(value));
}

export function formatWeekdayDate(value) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

export function formatTime(value) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function formatDateTime(value) {
  return `${formatDate(value)} · ${formatTime(value)}`;
}

export function formatMoney(value) {
  return value === null || value === undefined || value === "" ? "—" : new Intl.NumberFormat("en-US").format(value);
}

export function daysSince(value, now = new Date()) {
  return Math.max(0, Math.floor((now - new Date(value)) / 86_400_000));
}

export const formatDays = (n) => `${n} ${n === 1 ? "day" : "days"}`;

// "2026-10-16T14:00" -> { date: "2026-10-16", time: "14:00" }
export const splitDateTime = (value) => (value ? { date: value.slice(0, 10), time: value.slice(11, 16) } : { date: "", time: "" });

const sameDay = (a, b) => a.toDateString() === b.toDateString();

/** Label and urgency for a reminder row: { label, badge } */
export function getDueInfo(reminder, now = new Date()) {
  const due = new Date(reminder.dueAt);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  let day = formatDate(reminder.dueAt);
  if (sameDay(due, now)) day = "Due today";
  else if (sameDay(due, tomorrow)) day = "Tomorrow";

  const label = reminder.hasTime ? `${day} · ${formatTime(reminder.dueAt)}` : day;
  if (due < now && !(sameDay(due, now) && !reminder.hasTime)) return { label, badge: "Overdue" };
  if (sameDay(due, now)) return { label, badge: "Due soon" };
  return { label, badge: null };
}
