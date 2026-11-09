import { useEffect, useState } from "react";
import AuthLayout from "@/features/auth/components/AuthLayout";
import AuthHeader from "@/features/auth/components/AuthHeader";
import ForgotPasswordForm from "@/features/auth/components/forgotpassword/ForgotPasswordForm";
import ForgotPasswordSent from "@/features/auth/components/forgotpassword/ForgotPasswordSent";
import ForgotPasswordStory from "@/features/auth/components/forgotpassword/ForgotPasswordStory";
import { validateEmail } from "@/features/auth/utils/authValidation";
import * as authApi from "@/features/auth/api/authApi";
import { getApiError } from "@/lib/api";

const COOLDOWN_SECONDS = 60;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sent | wait
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // The server answers 204 for unknown emails too, so "sent" never reveals
  // whether an account exists.
  const send = async () => {
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      setStatus("sent");
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      const apiError = getApiError(err);
      if (apiError.status === 429) {
        setStatus("wait");
      } else {
        setStatus("idle");
        setError(apiError.fields?.email ?? apiError.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const message = validateEmail(email);
    if (message) {
      setError(message);
      event.currentTarget.elements.email?.focus();
      return;
    }

    setError("");
    send();
  };

  // Clears the error as soon as the typed value becomes valid.
  const handleEmailChange = (value) => {
    setEmail(value);
    if (error && !validateEmail(value)) setError("");
  };

  const handleChangeEmail = () => {
    setEmail("");
    setError("");
    setCooldown(0);
    setStatus("idle");
  };

  return (
    <AuthLayout
      story={<ForgotPasswordStory />}
      header={
        <AuthHeader prompt="No account yet?" linkLabel="Sign up free" to="/register" />
      }
    >
      {status === "sent" ? (
        <ForgotPasswordSent
          email={email}
          cooldown={cooldown}
          isSending={isSubmitting}
          onResend={send}
          onChangeEmail={handleChangeEmail}
        />
      ) : (
        <ForgotPasswordForm
          email={email}
          onEmailChange={handleEmailChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isRateLimited={status === "wait"}
          error={error}
        />
      )}
    </AuthLayout>
  );
}