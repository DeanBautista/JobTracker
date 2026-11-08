import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "@/features/auth/components/AuthLayout";
import VerifyEmailStory from "@/features/auth/components/verifyemail/VerifyEmailStory";
import VerifyEmailSuccess from "@/features/auth/components/verifyemail/VerifyEmailSuccess";
import VerifyEmailExpired from "@/features/auth/components/verifyemail/VerifyEmailExpired";
import { validateEmail } from "@/features/auth/utils/authValidation";

const VIEWS = ["success", "expired", "resent", "wait"];

// UI only. The initial view comes from the URL:
//   ?token=...  -> success      (no token -> expired)
//   ?state=wait -> forces a view (dev preview, delete once the API decides)
// TODO: verify the token on load; show "expired" when the server rejects it.
export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const preview = params.get("state");

  const [view, setView] = useState(
    VIEWS.includes(preview) ? preview : token ? "success" : "expired"
  );
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const message = validateEmail(email);
    if (message) {
      setError(message);
      event.currentTarget.elements.email?.focus();
      return;
    }

    // TODO: POST /verify-email/resend
    // On 429 -> setView("wait"). Always answer neutrally otherwise, so the
    // response never reveals whether the email has an account.
    setView("resent");
  };

  // Clears the error as soon as the typed value becomes valid.
  const handleEmailChange = (value) => {
    setEmail(value);
    if (error && !validateEmail(value)) setError("");
  };

  return (
    <AuthLayout
      story={<VerifyEmailStory />}
      storyNote="Verification links expire after 24 hours."
    >
      <Link
        to="/login"
        className="mb-7 inline-flex text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        Back to log in
      </Link>

      {view === "success" ? (
        <VerifyEmailSuccess />
      ) : (
        <VerifyEmailExpired
          status={view}
          email={email}
          error={error}
          onEmailChange={handleEmailChange}
          onSubmit={handleSubmit}
        />
      )}
    </AuthLayout>
  );
}