// Placeholder data until the API exists. Dates are relative to "now" so the demo never goes stale.
const now = new Date();
const daysAgo = (n) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const inDays = (n, hour = 9, minute = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const job = (id, title, company, location, mode, priority, stage, age, extra = {}) => ({
  id, title, company, location, mode, priority, stage,
  stageEnteredAt: daysAgo(age),
  deadline: null, interviewAt: null, replyBy: null,
  ...extra,
});

const SEED = [
  job(107, "Product Engineer", "Harbor & Pine", "Makati City, Metro Manila", "hybrid", "medium", "wishlist", 2),
  job(108, "Data Analyst", "Birchwood", "Quezon City, Metro Manila", "onsite", "low", "wishlist", 5),

  job(101, "Frontend Developer", "Northwind", "Philippines", "remote", "high", "applied", 4),
  job(103, "Junior Full Stack", "Kestrel Pay", "Philippines", "remote", "high", "applied", 5, { deadline: inDays(2) }),
  job(111, "Backend Developer", "Acme", "BGC, Taguig", "hybrid", "medium", "applied", 2, { deadline: inDays(6) }),

  job(105, "React Developer", "Fieldnote", "BGC, Taguig", "hybrid", "medium", "screening", 6),
  job(112, "QA Engineer", "Brightside", "Quezon City, Metro Manila", "onsite", "low", "screening", 2),

  job(102, "Software Engineer", "Orchard Labs", "Philippines", "remote", "high", "interview", 3, { interviewAt: inDays(0, 14, 0) }),
  job(113, "Product Designer", "Acme", "BGC, Taguig", "hybrid", "medium", "interview", 1, { interviewAt: inDays(4, 10, 30) }),

  job(106, "Web Developer", "Marlow Studio", "Philippines", "remote", "high", "offer", 2, { replyBy: inDays(5) }),
  job(114, "UX Designer", "Northwind", "Makati City, Metro Manila", "onsite", "high", "offer", 4, { replyBy: inDays(1) }),

  job(115, "Product Designer", "Acme", "BGC, Taguig", "hybrid", "low", "accepted", 0),
  job(116, "Data Analyst", "Birchwood", "Quezon City, Metro Manila", "onsite", "low", "rejected", 9),
  job(117, "QA Engineer", "Brightside", "Philippines", "remote", "medium", "withdrawn", 1),
  job(118, "Backend Developer", "Northwind", "Makati City, Metro Manila", "hybrid", "medium", "ghosted", 20),
];

// Each job gets a `position` inside its stage (lower = higher on the board), spaced by 1000
// so a drop between two cards can take the midpoint without renumbering anything else.
const byNewest = (a, b) => new Date(b.stageEnteredAt) - new Date(a.stageEnteredAt);
const counters = {};
export const MOCK_BOARD_JOBS = [...SEED].sort(byNewest).map((j) => {
  counters[j.stage] = (counters[j.stage] ?? -1) + 1;
  return { ...j, position: counters[j.stage] * 1000 };
});
