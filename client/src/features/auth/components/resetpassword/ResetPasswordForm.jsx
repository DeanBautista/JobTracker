import { useState } from "react";
import Input from "@/components/Input";
import AuthHeader from "@/features/auth/components/AuthHeader";
import {
  validateNewPassword,
  validateConfirmPassword,
} from "@/features/auth/utils/authValidation";

export default function ResetPasswordForm({ token }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();

    const next = {
      password: validateNewPassword(password),
      confirm: validateConfirmPassword(password, confirm),
    };
    setErrors(next);

    const firstInvalid = next.password ? "password" : next.confirm ? "confirm" : null;
    if (firstInvalid) {
      event.currentTarget.elements[firstInvalid]?.focus();
      return;
    }

    // TODO: POST /reset-password with { token, password }
  };

  // Clears an error as soon as the typed value becomes valid.
  const handlePasswordChange = (value) => {
    setPassword(value);
    if (errors.password && !validateNewPassword(value)) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleConfirmChange = (value) => {
    setConfirm(value);
    if (errors.confirm && !validateConfirmPassword(password, value)) {
      setErrors((prev) => ({ ...prev, confirm: "" }));
    }
  };

  return (
    <>
      <AuthHeader title="Choose a new password" />

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-5">
        <input type="hidden" name="token" value={token} />

        <Field id="password" label="New password" hint="At least 8 characters" error={errors.password}>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby="password-message"
            className="aria-invalid:border-danger"
            required
          />
        </Field>

        <Field id="confirm" label="Confirm new password" error={errors.confirm}>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            value={confirm}
            onChange={(e) => handleConfirmChange(e.target.value)}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirm)}
            aria-describedby="confirm-message"
            className="aria-invalid:border-danger"
            required
          />
        </Field>

        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink bg-ink px-4 text-sm font-medium text-on-ink transition-colors hover:border-accent hover:bg-accent hover:text-on-ink"
        >
          Save new password
        </button>
      </form>
    </>
  );
}

function Field({ id, label, hint, error, children }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      <p
        id={`${id}-message`}
        aria-live="polite"
        className={`text-[13px] ${error ? "text-danger" : "text-muted"}`}
      >
        {error || hint}
      </p>
    </div>
  );
}