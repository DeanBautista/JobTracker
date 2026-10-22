import { useState } from "react";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import Input from "@/components/Input";
import TextLink from "@/components/TextLink";
import PasswordInput from "../PasswordInput";
import { signInValidators } from "../../utils/authValidation";

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-red-600">
      {message}
    </p>
  );
}

// `invalid` is the server-level state (e.g. "Email or password is incorrect").
export default function SignInForm({ invalid = false }) {
  const [errors, setErrors] = useState({});

  // Inputs stay uncontrolled, so typing never re-renders the form.
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const nextErrors = {};
    for (const [name, validate] of Object.entries(signInValidators)) {
      const message = validate(String(data.get(name) ?? ""));
      if (message) nextErrors[name] = message;
    }

    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      form.elements[firstInvalid]?.focus();
      return;
    }

    // TODO: call real sign-in request here.
  };

  // Change events bubble to the form. State only updates when an
  // existing error becomes valid, so most keystrokes cause no re-render.
  const handleChange = (event) => {
  const { name, value } = event.target;
  const validate = signInValidators[name];
  if (!validate) return;

  setErrors((prev) => {
    if (!prev[name] || validate(value)) return prev; // same ref = no re-render
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

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

      <Button type="submit" variant="primary" fullWidth className="mt-5.5">
        Log in
      </Button>
    </form>
  );
}