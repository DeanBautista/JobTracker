export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#dashboard", label: "Dashboard" },
  { href: "#faq", label: "FAQ" },
];

export const BOARD_COLUMNS = [
  {
    stage: "Wishlist",
    jobs: [
      { title: "Product Engineer", company: "Harbor & Pine", meta: "Medium · 2d", priority: "low" },
      { title: "Data Analyst", company: "Linden Health", meta: "Low · 5d", priority: "low" },
    ],
  },
  {
    stage: "Applied",
    jobs: [
      { title: "Frontend Developer", company: "Northwind", meta: "High · 4d", priority: "high" },
      { title: "Backend Developer", company: "Orchard Labs", meta: "Medium · 6d", priority: "normal" },
      { title: "Full Stack Dev", company: "Kestrel Pay", meta: "High · 1d", priority: "high", lifted: true },
    ],
  },
  {
    stage: "Interview",
    jobs: [{ title: "React Developer", company: "Fieldnote", meta: "High · Thu", priority: "high" }],
  },
  {
    stage: "Offer",
    jobs: [{ title: "Web Developer", company: "Marlow Studio", meta: "Reply by Fri", priority: "normal" }],
  },
];

export const FACTS = [
  { value: "9 stages", label: "from Wishlist to Accepted" },
  { value: "5 MB", label: "PDF and Word files per document" },
  { value: "30 days", label: "in Trash before a job is removed" },
  { value: "Only you", label: "can open your jobs and files" },
];

// state: undefined = normal pill, "on" = current stage, "end" = closed outcome
export const STAGES = [
  { name: "Wishlist" },
  { name: "Applied" },
  { name: "Screening", state: "on" },
  { name: "Interview" },
  { name: "Offer" },
  { name: "Accepted" },
  { name: "Rejected", state: "end" },
  { name: "Withdrawn", state: "end" },
  { name: "Ghosted", state: "end" },
];

export const DOCUMENT_ROWS = [
  { label: "Resume v3.pdf", tag: "SENT RESUME" },
  { label: "Letter – Northwind.docx", tag: "SENT LETTER" },
  { label: "Portfolio notes.pdf", note: "attachment" },
];

export const SCHEDULE_ROWS = [
  { label: "Technical round", note: "Thu 14:00" },
  { label: "Reminder: 1 hour before", note: "Thu 13:00" },
  { label: "Follow up with recruiter", note: "in 3 days" },
];

export const WEEKLY_BARS = [38, 62, 50, 75, 62, 88, 50, 62];

export const STEPS = [
  { title: "Add a job", text: "Paste the link or fill in company and title. You get a warning if a similar job is already saved." },
  { title: "Move it across the board", text: "Each move is saved with a date, so you can see how long a job sat in each stage." },
  { title: "Attach what you sent", text: "Upload a PDF or Word file, or pick one you already stored. Label it, for example “Resume v3”." },
  { title: "Schedule interviews", text: "Add the round, date and time zone. Reminders are set for one day and one hour before." },
  { title: "Check what is working", text: "See your response rate, rejection reasons and which resume gets replies." },
];

export const DASHBOARD = {
  tiles: [
    { value: 24, label: "Applied" },
    { value: 9, label: "Replied" },
    { value: 3, label: "Interviewing" },
    { value: 1, label: "Offers" },
  ],
  funnel: [
    { label: "Applied", value: 24, percent: 100 },
    { label: "Replied", value: 9, percent: 38 },
    { label: "Interview", value: 3, percent: 13 },
    { label: "Offer", value: 1, percent: 5 },
  ],
  goal: { done: 4, target: 5 },
  results: [
    { resume: "Resume v3", sent: 14, replies: 7 },
    { resume: "Resume v2", sent: 10, replies: 2 },
  ],
};

export const NEXT_STEPS = [
  "Confirm your email with the link we send",
  "Pick a weekly goal, or skip it",
  "Add your first job and see it on the board",
];

export const FAQS = [
  { q: "Who can see my jobs?", a: "Only you. Opening a link to someone else’s record shows a not-found page." },
  { q: "What files can I attach?", a: "PDF and Word files up to 5 MB. PDFs preview in the app, and every file can be downloaded." },
  { q: "What happens if I delete a job?", a: "It moves to Trash for 30 days. You can restore it or remove it for good." },
  { q: "Does the demo account keep what I type?", a: "No. Demo data is shared and resets on a schedule, so nothing you type is kept." },
  { q: "Can I delete my account?", a: "Yes, in Settings. Your jobs, notes and stored files are removed." },
];

export const FOOTER_LINKS = [
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "GitHub repo", href: "https://github.com/" },
  { label: "Contact", href: "mailto:hello@example.com" },
];
