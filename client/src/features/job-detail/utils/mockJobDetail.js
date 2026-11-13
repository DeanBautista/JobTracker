// Mock data until the API exists. Dates are relative to "now" so the demo never
// goes stale. Try these ids: 101 interview, 102 offer, 103 rejected,
// 104 archived, 105 in trash, 106 nothing in any tab, "error" load failure,
// anything else -> not found.

const pad = (n) => String(n).padStart(2, "0");
const day = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const at = (offset, time) => `${day(offset)}T${time}`;

const BASE = {
  id: "101",
  title: "Frontend Developer",
  company: "Northwind",
  companyUrl: "https://northwind.example",
  link: "https://northwind.example/careers/frontend-developer",
  source: "LinkedIn",
  referredBy: "Jamie Chen",
  location: "Remote · Philippines",
  workMode: "remote",
  employmentType: "full-time",
  stage: "interview",
  priority: "high",
  createdAt: day(-45),
  stageChangedAt: at(-6, "09:30"),
  salaryMin: 45000,
  salaryMax: 65000,
  currency: "PHP",
  salaryPeriod: "month",
  datePosted: day(-50),
  dateApplied: day(-40),
  deadline: day(-10),
  description:
    "Northwind is looking for a Frontend Developer to build accessible, responsive experiences for its customer platform. Work with design and API teams, review pull requests, and improve UI performance. React experience and clear communication are valued.",
  offer: null,
  closure: null,
  archived: false,
  deletedAt: null,

  notes: [
    {
      id: "201",
      text: "Jamie confirmed the technical round will focus on React fundamentals, component design, and how I work with APIs. Prepare one example about improving a slow page.",
      createdAt: at(-1, "09:25"),
      edited: true,
      pinned: true,
    },
    {
      id: "198",
      text: "The recruiter said the team works across design and platform engineering. Ask about code review and onboarding during the next call.",
      createdAt: at(-3, "16:03"),
      edited: true,
      pinned: false,
    },
  ],

  documents: [
    { id: "302", name: "Northwind_Cover_Letter.pdf", kind: "Cover letter", ext: "PDF", size: "184 KB", addedAt: day(-40), url: "#", usedAs: "sent-cover-letter" },
    { id: "303", name: "Portfolio_2026.pdf", kind: "Portfolio", ext: "PDF", size: "2.4 MB", addedAt: day(-6), url: "#", usedAs: "attachment" },
    { id: "304", name: "Project_Summary.docx", kind: "Project summary", ext: "DOCX", size: "640 KB", addedAt: day(-5), url: "#", usedAs: "attachment" },
  ],
  fileLibrary: [
    { id: "e72", name: "Resume_v3.pdf", size: "1.1 MB", ext: "PDF" },
    { id: "e73", name: "Portfolio_2026.pdf", size: "2.4 MB", ext: "PDF" },
    { id: "e74", name: "Northwind_Cover_Letter.pdf", size: "184 KB", ext: "PDF" },
  ],

  interviews: [
    {
      id: "501",
      type: "Technical interview",
      interviewer: "Jordan Lee",
      role: "Engineering",
      startsAt: at(2, "14:00"),
      durationMin: 60,
      mode: "video",
      location: "https://meet.example/northwind-tech",
      prepNotes: "Review React rendering, API error handling, and one example of improving performance.",
      status: "scheduled",
      result: null,
    },
    {
      id: "498",
      type: "Recruiter screening",
      interviewer: "Jamie Chen",
      role: "Talent Partner",
      startsAt: at(-4, "10:30"),
      durationMin: 30,
      mode: "phone",
      location: "",
      prepNotes: "",
      status: "passed",
      result: {
        outcome: "passed",
        feedback: "Good conversation about the team and role. Recruiter asked for one technical round next.",
        rating: 4,
      },
    },
  ],

  reminders: [
    { id: "401", title: "Review interview notes", dueAt: at(0, "13:30"), hasTime: true, origin: "interview", createdAt: day(-1), note: "", doneAt: null },
    { id: "402", title: "Send availability to Jamie", dueAt: at(1, "10:00"), hasTime: true, origin: "follow-up", createdAt: day(-1), note: "", doneAt: null },
    { id: "398", title: "Send recruiter thank-you", dueAt: at(-1, "09:00"), hasTime: true, origin: "interview", createdAt: day(-3), note: "", doneAt: at(-1, "09:40"), doneBy: "Alex Reyes" },
  ],

  // type: stage | note | interview | file | reminder
  timeline: [
    { id: "t6", type: "interview", title: "Interview scheduled", detail: "Technical interview with Jordan Lee.", at: at(-1, "09:25") },
    { id: "t5", type: "reminder", title: "Reminder done", detail: "Review Northwind interview notes.", at: at(-1, "08:42") },
    { id: "t4", type: "file", title: "Attached Resume v3", at: at(-2, "18:12"), link: { label: "Resume_v3.pdf", href: "#" } },
    { id: "t3", type: "interview", icon: "★", title: "Interview result: Passed", detail: "Recruiter screening.", at: at(-2, "11:22") },
    { id: "t2", type: "note", title: "Note added", detail: "Prepare examples about React and API integration.", at: at(-3, "16:03") },
    { id: "t1", type: "stage", title: "Moved from Applied to Screening", detail: "Stage changed by Alex Reyes.", at: at(-6, "09:30") },
  ],
};

const JOBS = {
  101: BASE,
  102: {
    ...BASE,
    id: "102",
    stage: "offer",
    stageChangedAt: at(-2, "10:00"),
    offer: {
      salary: 62000,
      currency: "PHP",
      period: "month",
      replyBy: day(5),
      notes: "Benefits listed include health coverage and a learning budget. Ask about equipment allowance.",
    },
  },
  103: {
    ...BASE,
    id: "103",
    stage: "rejected",
    closure: {
      reason: "not_enough_experience",
      previousStage: "interview",
      closedDate: day(-2),
      note: "The team moved forward with a candidate whose recent project experience was closer to the role.",
    },
  },
  104: { ...BASE, id: "104", archived: true },
  105: { ...BASE, id: "105", deletedAt: day(-3) },
  106: { ...BASE, id: "106", notes: [], documents: [], interviews: [], reminders: [], timeline: [], description: "" },
};

export const getMockJob = (id) => JOBS[id] ?? null;
