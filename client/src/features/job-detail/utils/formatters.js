// Date-only values ("2026-09-01") are formatted in UTC so they never shift a day.
// Date-times ("2026-10-16T14:00", no zone) are local wall-clock time.

const isDateOnly = (value) => value.length === 10;

const HAS_ZONE = /(Z|[+-]\d{2}:\d{2})$/;
const pad = (n) => String(n).padStart(2, "0");

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

// "2026-10-16T14:00" (local, no zone) or "2026-10-16T06:00:00Z" (UTC) -> { date, time } in local time
export function splitDateTime(value) {
  if (!value) return { date: "", time: "" };
  if (!HAS_ZONE.test(value)) return { date: value.slice(0, 10), time: value.slice(11, 16) };
  const d = new Date(value);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

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
