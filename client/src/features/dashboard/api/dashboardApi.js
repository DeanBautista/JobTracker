import { api } from "@/lib/api";

export const fetchFunnel = (range) =>
  api.get("/dashboard/funnel", { params: { range } }).then((res) => res.data);

export const fetchWeekly = () => api.get("/dashboard/weekly").then((res) => res.data);

export const fetchBreakdown = (range) =>
  api.get("/dashboard/breakdown", { params: { range } }).then((res) => res.data);

export const fetchStats = (range) =>
  api.get("/dashboard/stats", { params: { range } }).then((res) => res.data);

export const fetchHasJobs = () => api.get("/dashboard/has-jobs").then((res) => res.data);