// Derived text for a job card. Everything is computed from dates so nothing goes stale.
const DAY_MS = 86_400_000;
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

const startOfDay = (value) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};
const calendarDays = (from, to) => Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS);
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function stageAgeLabel(job, now = new Date()) {
  const days = Math.max(0, calendarDays(job.stageEnteredAt, now));
  return `${plural(days, "day")} in stage`;
}

// tone: "neutral" | "urgent" | "positive"
export function getCardChips(job, now = new Date()) {
  const chips = [];

  if (job.stage === "interview" && job.interviewAt) {
    const d = calendarDays(now, job.interviewAt);
    const day = d === 0 ? "Today" : d === 1 ? "Tomorrow" : dateFmt.format(new Date(job.interviewAt));
    chips.push({
      key: "interview",
      tone: "neutral",
      prefix: "Interview",
      label: `${day} · ${timeFmt.format(new Date(job.interviewAt))}`,
    });
  }

  if (job.stage === "offer" && job.replyBy) {
    const d = calendarDays(now, job.replyBy);
    chips.push({
      key: "reply",
      tone: d <= 2 ? "urgent" : "positive",
      label: `Reply by ${dateFmt.format(new Date(job.replyBy))}`,
    });
  }

  if ((job.stage === "wishlist" || job.stage === "applied") && job.deadline) {
    const d = calendarDays(now, job.deadline);
    const date = dateFmt.format(new Date(job.deadline));
    if (d < 0) chips.push({ key: "deadline", tone: "urgent", label: `Deadline passed · ${date}` });
    else if (d <= 3) {
      const when = d === 0 ? "today" : `in ${plural(d, "day")}`;
      chips.push({ key: "deadline", tone: "urgent", label: `Deadline ${when} · ${date}` });
    } else chips.push({ key: "deadline", tone: "neutral", label: `Deadline · ${date}` });
  }

  return chips;
}
