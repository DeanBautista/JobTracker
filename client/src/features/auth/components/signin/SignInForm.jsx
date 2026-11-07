import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import Input from "@/components/Input";
import TextLink from "@/components/TextLink";
import PasswordInput from "../PasswordInput";
import { signInValidators } from "../../utils/authValidation";
import { useAuth } from "../../context/useAuth";
import { getApiError } from "@/lib/api";

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-red-600">
      {message}
    </p>
  );
}

// `status` and `onStatusChange` are owned by SignInPage so the banner above the form can react.
export default function SignInForm({ status, onStatusChange }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const nextErrors = {};
    for (const [name, validate] of Object.entries(signInValidators)) {
      const message = validate(String(data.get(name) ?? ""));
      if (message) nextErrors[name] = message;
    }

    setErrors(nextErrors);
    setFormError("");
    onStatusChange(null);

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      form.elements[firstInvalid]?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await login({
        email: String(data.get("email")),
        password: String(data.get("password")),
      });
      navigate(location.state?.from?.pathname ?? "/dashboard", { replace: true });
    } catch (err) {
      const { code, message, fields } = getApiError(err);

      if (code === "invalid_credentials") {
        onStatusChange("error");
      } else if (code === "too_many_attempts") {
        onStatusChange("locked");
      } else if (Object.keys(fields).length > 0) {
        setErrors(fields);
      } else {
        setFormError(message);
      }
      setSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const validate = signInValidators[name];
    if (!validate) return;

    setErrors((prev) => {
      if (!prev[name] || validate(value)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const invalid = status === "error";

  return (
    <form
      onSubmit={handleSubmit}
      onChange={handleChange}
      noValidate
      className="mt-6.5"
    >
      <div className="space-y-4.5">
        <FormField id="email" label="Email">
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            required
            invalid={invalid || Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          <FieldError id="email-error" message={errors.email} />
        </FormField>

        <FormField
          id="password"
          label="Password"
          aside={<TextLink to="/forgot-password">Forgot password?</TextLink>}
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            maxLength={128}
            required
            invalid={invalid || Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <FieldError id="password-error" message={errors.password} />
        </FormField>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        className="mt-5.5"
        disabled={submitting}
      >
        {submitting ? "Logging in..." : "Log in"}
      </Button>

      {formError && (
        <p role="alert" className="mt-3 text-[13.5px] text-red-600">
          {formError}
        </p>
      )}
    </form>
  );
}