const dashboardModel = require('../models/dashboardModel');

// 30 and 90 days; anything else means all time.
const RANGES = new Map([
  ['30', 30],
  ['90', 90],
]);
const parseDays = (query) => RANGES.get(query.range) ?? null;

// GET /dashboard/funnel?range=30|90|all  ->  { steps: [{ stage, count }] }
const getFunnel = async (req, res) => {
  res.json({ steps: await dashboardModel.funnel(req.userId, parseDays(req.query)) });
};

// GET /dashboard/weekly  ->  { goal, counts: [8 numbers, oldest first] }
const getWeekly = async (req, res) => {
  res.json(await dashboardModel.weekly(req.userId));
};

// GET /dashboard/breakdown?range=...  ->  { sources, rejections }
const getBreakdown = async (req, res) => {
  res.json(await dashboardModel.breakdown(req.userId, parseDays(req.query)));
};

// GET /dashboard/stats?range=...  ->  { current, previous }
const getStats = async (req, res) => {
  res.json(await dashboardModel.stats(req.userId, parseDays(req.query)));
};

// GET /dashboard/has-jobs  ->  { hasJobs: boolean }
const getHasJobs = async (req, res) => {
  res.json({ hasJobs: await dashboardModel.hasJobs(req.userId) });
};

module.exports = { getFunnel, getWeekly, getBreakdown, getStats, getHasJobs };