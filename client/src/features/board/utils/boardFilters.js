import { ALL_STAGES } from "./boardStages";

export function filterJobs(jobs, { q, mode, priority }) {
  const needle = q.trim().toLowerCase();
  return jobs.filter((job) => {
    if (mode.length && !mode.includes(job.mode)) return false;
    if (priority.length && !priority.includes(job.priority)) return false;
    if (needle && !`${job.title} ${job.company} ${job.location}`.toLowerCase().includes(needle)) {
      return false;
    }
    return true;
  });
}

// { wishlist: [...], applied: [...], ... }, each list ordered by the job's saved `position`.
export function groupByStage(jobs) {
  const groups = Object.fromEntries(ALL_STAGES.map((s) => [s.value, []]));
  for (const job of jobs) (groups[job.stage] ??= []).push(job);
  for (const list of Object.values(groups)) {
    list.sort((a, b) => a.position - b.position);
  }
  return groups;
}
