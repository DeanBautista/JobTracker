// Sample data for the UI. Replace with a useDashboard() hook later.
// Shape = what the components expect, so the hook only has to return this.

export const mockDashboard = {
  isEmpty: false,
  emailUnverified: true,

  attention: [
    {
      id: "r1",
      tag: "Overdue",
      late: true,
      title: "Follow up: Northwind",
      detail: "Frontend Developer · due 2 days ago",
      actions: [
        { key: "done", label: "Done" },
        { key: "snooze", label: "Snooze" },
      ],
    },
    {
      id: "r2",
      tag: "Interview today",
      title: "Orchard Labs, 14:00",
      detail: "Technical round · video",
      actions: [{ label: "Open job", to: "/jobs/102" }],
    },
    {
      id: "r3",
      tag: "Deadline in 2 days",
      late: true,
      title: "Kestrel Pay",
      detail: "Junior Full Stack · apply by Friday",
      actions: [{ label: "Open job", to: "/jobs/103" }],
    },
    {
      id: "r4",
      tag: "Stale",
      title: "Linden Health",
      detail: "No activity for 14 days",
      actions: [
        { key: "ghosted", label: "Mark ghosted" },
        { key: "dismiss", label: "Dismiss" },
      ],
    },
  ],

  // One entry per range. `delta` is optional (no comparison for all time).
  tiles: [
    {
      id: "applied",
      label: "Applied",
      hint: "Jobs moved to Applied in the selected range.",
      values: {
        30: { value: "24", delta: "+6", note: "vs previous 30 days" },
        90: { value: "61", delta: "+12", note: "vs previous 90 days" },
        all: { value: "88", note: "No comparison for all time" },
      },
    },
    {
      id: "response",
      label: "Response rate",
      hint: "Share of applied jobs that got any reply, including a rejection.",
      values: {
        30: { value: "38%", delta: "+4 pts", note: "vs previous" },
        90: { value: "33%", delta: "+2 pts", note: "vs previous" },
        all: { value: "31%", note: "No comparison" },
      },
    },
    {
      id: "interviewing",
      label: "Interviewing",
      hint: "Jobs currently in the Interview stage.",
      values: {
        30: { value: "3", delta: "+1", note: "vs previous" },
        90: { value: "7", delta: "+2", note: "vs previous" },
        all: { value: "9", note: "No comparison" },
      },
    },
    {
      id: "offers",
      label: "Offers",
      hint: "Jobs that reached the Offer stage in the range.",
      values: {
        30: { value: "1", note: "Same as previous" },
        90: { value: "2", delta: "+1", note: "vs previous" },
        all: { value: "3", note: "No comparison" },
      },
    },
  ],

  funnel: [
    { stage: "Applied", count: 24 },
    { stage: "Screening", count: 13 },
    { stage: "Interview", count: 7 },
    { stage: "Offer", count: 2 },
  ],

  weekly: { goal: 5, counts: [3, 7, 5, 2, 7, 4, 6, 3] },

  sources: [
    { name: "LinkedIn", total: 10, replies: 4 },
    { name: "Company site", total: 6, replies: 3 },
    { name: "Referral", total: 3, replies: 2 },
    { name: "Other", total: 5, replies: 0 },
  ],

  rejections: {
    topStage: "Screening",
    reasons: [
      { key: "no_response", label: "No response", count: 7 },
      { key: "experience", label: "Experience", count: 4 },
      { key: "position_closed", label: "Position closed", count: 2 },
      { key: "salary", label: "Salary", count: 1 },
    ],
  },

  resumes: [
    { name: "Resume v3", total: 12, replies: 6 },
    { name: "Resume v2", total: 9, replies: 2 },
    { name: "Resume v1", total: 3, replies: 1 },
  ],

  upcoming: [
    { jobId: 102, weekday: "Wed", day: "14", company: "Orchard Labs", round: "Technical", meta: "14:00, video · prep notes added", isToday: true },
    { jobId: 105, weekday: "Fri", day: "16", company: "Fieldnote", round: "Phone screen", meta: "09:30, phone" },
    { jobId: 106, weekday: "Tue", day: "20", company: "Marlow Studio", round: "Panel", meta: "11:00, onsite" },
  ],
};
