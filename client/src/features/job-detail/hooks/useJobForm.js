import { useState } from "react";
import { toFormValues, toPayload, validateJobForm } from "../utils/jobForm";

// Payload keys that affect more than their own form field.
const RELATED_FIELDS = {
  stage: ["stage", "closeReason", "closureNote"],
  currency: ["currency", "offerCurrency"], // offerCurrency can fall back to currency
  salaryPeriod: ["salaryPeriod", "offerPeriod"], // same for the period
  offer: ["offerSalary", "offerCurrency", "offerPeriod", "offerReplyBy", "offerNotes"],
  closure: ["closeReason", "closureNote"],
};

/**
 * Controlled form state for the overview tab (and the editable header fields).
 *
 *   const form = useJobForm(job);
 *   <Field {...form.bind("company")} />          // value + onChange + error
 *   <form onSubmit={form.submit(onValidPayload, onInvalid)} noValidate>
 */
export default function useJobForm(job) {
  const [values, setValues] = useState(() => toFormValues(job));
  const [errors, setErrors] = useState({});
  const [showSummary, setShowSummary] = useState(false);

  const setValue = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const setError = (name, message) => setErrors((prev) => ({ ...prev, [name]: message }));

  const bind = (name) => ({
    value: values[name],
    error: errors[name],
    onChange: (e) => setValue(name, e.target.value),
  });

  const submit = (onValid, onInvalid) => (e) => {
    e.preventDefault();
    const next = validateJobForm(values);
    setErrors(next);
    const invalid = Object.keys(next).length > 0;
    setShowSummary(invalid);
    if (invalid) onInvalid?.();
    else onValid(toPayload(values));
  };

  const syncSaved = (savedJob, patch, submitted) => {
    const server = toFormValues(savedJob);
    const fields = Object.keys(patch).flatMap((key) => RELATED_FIELDS[key] ?? [key]);

    setValues((prev) => {
      const next = { ...prev };
      for (const field of fields) {
        if (prev[field] === submitted[field]) next[field] = server[field];
      }
      return next;
    });
  };

  const reset = (savedJob) => {
    setValues(toFormValues(savedJob));
    setErrors({});
    setShowSummary(false);
  };

  return { values, errors, showSummary, bind, setValue, setError, submit, syncSaved, reset };
}