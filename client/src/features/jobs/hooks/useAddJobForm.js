import { useRef, useState } from "react";
import useToast from "@/hooks/useToast";
import createJob from "../api/createJob";
import validateJob from "../utils/validateJob";

const UNCERTAIN_MESSAGE =
  "We couldn't confirm the save. The job may have been added, so check your list before trying again.";

export default function useAddJobForm({ onDone, onCreated }) {
  const { show } = useToast();
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

      onCreated?.(result.job);
      show("Job added.", { duration: 5000 });

      if (anotherRef.current) {
        form.reset();
        setErrors({});
        focusField(form, "title");
      } else {
        onDone();
      }
    } catch (error) {
      const response = error.cause?.response;
      const uncertain = Boolean(error.cause) && (!response || response.status === 504);
      const message = uncertain
        ? UNCERTAIN_MESSAGE
        : error.message || "Could not save the job. Try again.";

      setFormError(message);
      show(message, uncertain ? { duration: 10000 } : undefined);

      // The job may exist, so refresh the lists that watch for new jobs.
      if (uncertain) onCreated?.();
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