import { CLOSED_STAGES, OPEN_STAGES } from "../utils/jobOptions";
import { MOCK_JOBS } from "../utils/mockJobs";

const CLOSED_VALUES = CLOSED_STAGES.map((s) => s.value);
const STAGE_ORDER = [...OPEN_STAGES, ...CLOSED_STAGES].map((s) => s.value);
const PRIORITY_RANK = { high: 3, medium: 2, low: 1 };

const SORTERS = {
  title: (a, b) => a.title.localeCompare(b.title),
  company: (a, b) => a.company.localeCompare(b.company),
  stage: (a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage),
  priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
  applied: (a, b) => (a.appliedAt ?? "").localeCompare(b.appliedAt ?? ""),
  days: (a, b) => a.daysInStage - b.daysInStage,
};

// Placeholder: filters/sorts/pages the mock data on the client.
// Replace the body with an API call using the same params; keep the return shape.
export default function useJobs({ filters, sort, dir, page, size }) {
  const q = filters.q.toLowerCase();

  const matched = MOCK_JOBS.filter(
    (job) =>
      (!q || `${job.title} ${job.company}`.toLowerCase().includes(q)) &&
      (!filters.stage ||
        (filters.stage === "closed" ? CLOSED_VALUES.includes(job.stage) : job.stage === filters.stage)) &&
      (!filters.mode || job.mode === filters.mode) &&
      (!filters.priority || job.priority === filters.priority) &&
      (!filters.source || job.source === filters.source),
  );

  const sorted = [...matched].sort(SORTERS[sort] ?? SORTERS.applied);
  if (dir === "desc") sorted.reverse();

  const start = (page - 1) * size;

  return {
    status: "success", // "loading" | "error" | "success"
    jobs: sorted.slice(start, start + size),
    total: matched.length,
  };
}