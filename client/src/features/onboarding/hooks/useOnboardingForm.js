import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GOAL_DEFAULT, validateGoal, validateJob } from "../utils/validate";
import { getApiError } from "@/lib/api";
import { useAuth } from "@/features/auth/context/useAuth";
import createJob from "@/features/jobs/api/createJob";

// state is one of: "step1" | "step1-errors" | "step2" | "step2-errors"
export function useOnboardingForm() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState("step1");
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    weekly_goal: String(GOAL_DEFAULT),
    desired_role: "",
    location: "",
    title: "",
    company: "",
    link: "",
    stage: "wishlist",
  });

  // If the job saved but completeOnboarding failed, a retry must not create it twice.
  const jobSavedRef = useRef(false);

  const step = state.startsWith("step1") ? 1 : 2;

  function setValue(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function finish({ withJob }) {
    if (submitting) return;
    // TODO: save weekly_goal (+ role/location)
    setSubmitting(true);
    try {
      if (withJob && !jobSavedRef.current) {
        const result = await createJob({
          title: values.title.trim(),
          company: values.company.trim(),
          link: values.link.trim(),
          stage: values.stage,
        });

        if (result.errors) {
          setErrors(result.errors);
          setState("step2-errors");
          return;
        }
        if (result.duplicate) {
          setErrors({ link: "You already added this link" });
          setState("step2-errors");
          return;
        }
        jobSavedRef.current = true;
      }

      await completeOnboarding();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      // createJob throws a plain Error; completeOnboarding throws an axios error.
      setErrors({ form: err.response ? getApiError(err).message : err.message });
    } finally {
      setSubmitting(false);
    }
  }

  function submitGoal(e) {
    e.preventDefault();
    const error = validateGoal(values.weekly_goal);
    if (error) {
      setErrors({ weekly_goal: error });
      setState("step1-errors");
      return;
    }
    setErrors({});
    setState("step2");
  }

  function submitJob(e) {
    e.preventDefault();
    const jobErrors = validateJob(values);
    if (Object.keys(jobErrors).length > 0) {
      setErrors(jobErrors);
      setState("step2-errors");
      return;
    }
    finish({ withJob: true });
  }

  function goBack() {
    setErrors({});
    setState("step1");
  }

  return {
    state,
    step,
    values,
    errors,
    submitting,
    setValue,
    submitGoal,
    submitJob,
    goBack,
    skipJob: () => finish({ withJob: false }),
  };
}