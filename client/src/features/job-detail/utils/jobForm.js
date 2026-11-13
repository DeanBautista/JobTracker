// Form state <-> job object. Form values are always strings.

export function toFormValues(job) {
  return {
    title: job.title,
    company: job.company,
    link: job.link ?? "",
    source: job.source ?? "",
    referredBy: job.referredBy ?? "",
    location: job.location ?? "",
    workMode: job.workMode ?? "remote",
    employmentType: job.employmentType ?? "full-time",
    stage: job.stage,
    priority: job.priority,

    salaryMin: job.salaryMin ?? "",
    salaryMax: job.salaryMax ?? "",
    currency: job.currency ?? "PHP",
    salaryPeriod: job.salaryPeriod ?? "month",

    datePosted: job.datePosted ?? "",
    dateApplied: job.dateApplied ?? "",
    deadline: job.deadline ?? "",
    description: job.description ?? "",

    offerSalary: job.offer?.salary ?? "",
    offerCurrency: job.offer?.currency ?? job.currency ?? "PHP",
    offerPeriod: job.offer?.period ?? job.salaryPeriod ?? "month",
    offerReplyBy: job.offer?.replyBy ?? "",
    offerNotes: job.offer?.notes ?? "",

    closeReason: job.closure?.reason ?? "other",
    previousStage: job.closure?.previousStage ?? "interview",
    closedDate: job.closure?.closedDate ?? "",
    closureNote: job.closure?.note ?? "",
  };
}

const isHttpUrl = (value) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

export function validateJobForm(v) {
  const errors = {};
  if (!v.title.trim()) errors.title = "Enter a job title.";
  if (!v.company.trim()) errors.company = "Enter the company name.";
  if (v.link && !isHttpUrl(v.link)) errors.link = "Enter a valid URL including https://.";

  for (const key of ["salaryMin", "salaryMax", "offerSalary"]) {
    if (v[key] !== "" && Number(v[key]) < 0) errors[key] = "Enter a non-negative amount.";
  }
  if (!errors.salaryMin && !errors.salaryMax && v.salaryMin !== "" && v.salaryMax !== "" && Number(v.salaryMax) < Number(v.salaryMin)) {
    errors.salaryMax = "Maximum salary must be at least the minimum.";
  }
  return errors;
}

const num = (value) => (value === "" ? null : Number(value));

// Shape the API will receive on "Save changes".
export function toPayload(v) {
  return {
    title: v.title.trim(),
    company: v.company.trim(),
    link: v.link.trim(),
    source: v.source.trim(),
    referredBy: v.referredBy.trim(),
    location: v.location.trim(),
    workMode: v.workMode,
    employmentType: v.employmentType,
    stage: v.stage,
    priority: v.priority,
    salaryMin: num(v.salaryMin),
    salaryMax: num(v.salaryMax),
    currency: v.currency,
    salaryPeriod: v.salaryPeriod,
    datePosted: v.datePosted,
    dateApplied: v.dateApplied,
    deadline: v.deadline,
    description: v.description,
    offer: { salary: num(v.offerSalary), currency: v.offerCurrency, period: v.offerPeriod, replyBy: v.offerReplyBy, notes: v.offerNotes },
    closure: { reason: v.closeReason, previousStage: v.previousStage, closedDate: v.closedDate, note: v.closureNote },
  };
}
