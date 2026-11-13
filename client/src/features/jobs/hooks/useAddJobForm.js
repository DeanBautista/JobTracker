import { useRef, useState } from "react";
import createJob from "../api/createJob";
import validateJob from "../utils/validateJob";

export default function useAddJobForm({ onDone }) {
  const anotherRef = useRef(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [duplicate, setDuplicate] = useState(null);
  const [saving, setSaving] = useState(false);

  // Opens the "More details" panel if the field lives inside it.
  const focusField = (form, name) => {
    const field = form.elements[name];
    field?.closest("details")?.setAttribute("open", "");
    field?.focus();
  };

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = event.nativeEvent.submitter?.name;
    const confirmDuplicate = submitter === "confirm_duplicate";
    if (!confirmDuplicate) anotherRef.current = submitter === "another";

    const values = Object.fromEntries(new FormData(form));
    const found = validateJob(values);
    setErrors(found);
    setFormError("");

    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      focusField(form, firstInvalid);
      return;
    }

    setSaving(true);
    setDuplicate(null);
    try {
      const result = await createJob(values, { confirmDuplicate });

      if (result.errors) {
        setErrors(result.errors);
        focusField(form, Object.keys(result.errors)[0]);
        return;
      }
      if (result.duplicate) {
        setDuplicate(result.duplicate);
        return;
      }

      if (anotherRef.current) {
        form.reset();
        setErrors({});
        focusField(form, "title");
      } else {
        onDone();
      }
    } catch (error) {
      setFormError(error.message || "Could not save the job. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return {
    errors,
    formError,
    duplicate,
    saving,
    submit,
    clearDuplicate: () => setDuplicate(null),
  };
}