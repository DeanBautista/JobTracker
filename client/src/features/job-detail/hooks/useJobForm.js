import { useState } from "react";
import { toFormValues, toPayload, validateJobForm } from "../utils/jobForm";

/**
 * Controlled form state for the overview tab (and the editable header fields).
 *
 *   const form = useJobForm(job);
 *   <Field {...form.bind("company")} />          // value + onChange + error
 *   <form onSubmit={form.submit(onValidPayload)} noValidate>
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

  const submit = (onValid) => (e) => {
    e.preventDefault();
    const next = validateJobForm(values);
    setErrors(next);
    const invalid = Object.keys(next).length > 0;
    setShowSummary(invalid);
    if (!invalid) onValid(toPayload(values));
  };

  return { values, errors, showSummary, bind, setValue, setError, submit };
}
