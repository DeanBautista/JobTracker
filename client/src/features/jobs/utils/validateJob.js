const isHttpUrl = (value) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

const filled = (v) => v !== undefined && v !== null && v !== "";

// Mirror these checks on the server.
// Fields that are not on screen (offer / closing sections) are not in `values`, so they are skipped.
export default function validateJob(values) {
  const errors = {};

  if (!values.title?.trim()) errors.title = "Enter a job title.";
  if (!values.company?.trim()) errors.company = "Enter a company.";
  if (values.link?.trim() && !isHttpUrl(values.link.trim())) {
    errors.link = "Enter a valid URL including https://.";
  }

  if (values.currency && !/^[A-Za-z]{3}$/.test(values.currency)) {
    errors.currency = "Use a 3-letter code, like PHP.";
  }

  for (const key of ["salaryMin", "salaryMax"]) {
    if (filled(values[key]) && Number(values[key]) < 0) errors[key] = "Enter a non-negative amount.";
  }
  const { salaryMin: min, salaryMax: max } = values;
  if (!errors.salaryMin && !errors.salaryMax && filled(min) && filled(max) && Number(max) < Number(min)) {
    errors.salaryMax = "Max salary must be at least min salary.";
  }

  if (filled(values.offerSalary) && Number(values.offerSalary) < 0) {
    errors.offerSalary = "Enter a non-negative amount.";
  }
  if (values.offerCurrency && !/^[A-Za-z]{3}$/.test(values.offerCurrency)) {
    errors.offerCurrency = "Use a 3-letter code, like PHP.";
  }

  return errors;
}