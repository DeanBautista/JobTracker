import { useState } from "react";
import AuthLayout from "@/features/auth/components/AuthLayout";
import AuthHeader from "@/features/auth/components/AuthHeader";
import ForgotPasswordForm from "@/features/auth/components/forgotpassword/ForgotPasswordForm";
import ForgotPasswordSent from "@/features/auth/components/forgotpassword/ForgotPasswordSent";
import ForgotPasswordStory from "@/features/auth/components/forgotpassword/ForgotPasswordStory";
import { validateEmail } from "@/features/auth/utils/authValidation";

// UI only: the status is local state for now. Swap the TODO for the real API call later.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sent | wait

  const handleSubmit = (event) => {
    event.preventDefault();

    const message = validateEmail(email);
    if (message) {
      setError(message);
      event.currentTarget.elements.email?.focus();
      return;
    }

    // TODO: call the forgot-password endpoint
    setStatus("sent");
  };

  // Clears the error as soon as the typed value becomes valid.
  const handleEmailChange = (value) => {
    setEmail(value);
    if (error && !validateEmail(value)) setError("");
  };

  const handleChangeEmail = () => {
    setEmail("");
    setError("");
    setStatus("idle");
  };

  return (
    <AuthLayout
      story={<ForgotPasswordStory />}
      header={
        <AuthHeader prompt="No account yet?" linkLabel="Sign up free" to="/signup" />
      }
    >
      {status === "sent" ? (
        <ForgotPasswordSent
          email={email}
          onResend={() => setStatus("sent")}
          onChangeEmail={handleChangeEmail}
        />
      ) : (
        <ForgotPasswordForm
          email={email}
          onEmailChange={handleEmailChange}
          onSubmit={handleSubmit}
          isRateLimited={status === "wait"}
          error={error}
        />
      )}
    </AuthLayout>
  );
}