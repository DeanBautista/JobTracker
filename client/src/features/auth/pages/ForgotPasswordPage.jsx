import { useState } from "react";
import AuthLayout from "@/features/auth/components/AuthLayout";
import AuthHeader from "@/features/auth/components/AuthHeader";
import ForgotPasswordForm from "@/features/auth/components/forgotpassword/ForgotPasswordForm";
import ForgotPasswordSent from "@/features/auth/components/forgotpassword/ForgotPasswordSent";
import ForgotPasswordStory from "@/features/auth/components/forgotpassword/ForgotPasswordStory";

// UI only: the status is local state for now. Swap the TODO for the real API call later.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sent | wait

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: call the forgot-password endpoint
    setStatus("sent");
  };

  const handleChangeEmail = () => {
    setEmail("");
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
          onEmailChange={setEmail}
          onSubmit={handleSubmit}
          isRateLimited={status === "wait"}
        />
      )}
    </AuthLayout>
  );
}