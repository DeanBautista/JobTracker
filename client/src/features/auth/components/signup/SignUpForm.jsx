import { useState } from "react";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import Input from "@/components/Input";
import TextLink from "@/components/TextLink";
import PasswordInput from "../PasswordInput";
import { signUpValidators } from "../../utils/authValidation";

export default function SignUpForm() {
  const [errors, setErrors] = useState({});

  // Inputs stay uncontrolled, so typing never re-renders the form.
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const nextErrors = {};
    for (const [name, validate] of Object.entries(signUpValidators)) {
      const message = validate(String(data.get(name) ?? ""));
      if (message) nextErrors[name] = message;
    }

    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      form.elements[firstInvalid]?.focus();
      return;
    }

    // TODO: call real sign-up request here.
  };

  // Only touches state when a field that currently has an error becomes valid.
  const handleChange = (event) => {
    const { name, value } = event.target;
    const validate = signUpValidators[name];
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
        <FormField id="name" label="Name" error={errors.name}>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={80}
            required
            error={errors.name}
          />
        </FormField>

        <FormField id="email" label="Email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            required
            error={errors.email}
          />
        </FormField>

        <FormField
          id="password"
          label="Password"
          hint="At least 8 characters."
          error={errors.password}
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            maxLength={128}
            required
            aria-describedby="password-hint"
            error={errors.password}
          />
        </FormField>
      </div>

      <Button type="submit" variant="primary" fullWidth className="mt-5.5">
        Create account
      </Button>

      <p className="mt-4 text-[13.5px] text-muted">
        By creating an account you agree to the{" "}
        <TextLink to="/terms">Terms</TextLink> and{" "}
        <TextLink to="/privacy">Privacy Policy</TextLink>.
      </p>
    </form>
  );
}