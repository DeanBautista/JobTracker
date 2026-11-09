import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "@/features/auth/components/AuthLayout";
import VerifyEmailStory from "@/features/auth/components/verifyemail/VerifyEmailStory";
import VerifyEmailSuccess from "@/features/auth/components/verifyemail/VerifyEmailSuccess";
import VerifyEmailExpired from "@/features/auth/components/verifyemail/VerifyEmailExpired";
import { validateEmail } from "@/features/auth/utils/authValidation";
import { useAuth } from "@/features/auth/context/useAuth";
import * as authApi from "@/features/auth/api/authApi";
import { getApiError } from "@/lib/api";

const VIEWS = ["success", "expired", "resent", "wait"];

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const preview = params.get("state"); // dev preview only, delete when done
  const navigate = useNavigate();
  const { status, verifyEmail } = useAuth();

  const [view, setView] = useState(
    VIEWS.includes(preview) ? preview : token ? "verifying" : "expired"
  );
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const called = useRef(false);

  // Verify once. Waits for the startup session check so it can't overwrite
  // the signed-in state. The ref blocks StrictMode's double effect, since a
  // token can only be used once.
  useEffect(() => {
    if (view !== "verifying" || status === "loading" || called.current) return;
    called.current = true;

    verifyEmail(token)
      .then(() => setView("success"))
      .catch((err) => {
        const apiError = getApiError(err);
        if (apiError.code === "invalid_token") setView("expired");
        else setLoadError(apiError.message);
      });
  }, [view, status, token, verifyEmail]);

  // Send the user into the app shortly after success.
  useEffect(() => {
    if (view !== "success" || preview) return;
    const timer = setTimeout(() => navigate("/dashboard", { replace: true }), 2500);
    return () => clearTimeout(timer);
  }, [view, preview, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    const message = validateEmail(email);
    if (message) {
      setError(message);
      form.elements.email?.focus();
      return;
    }

    try {
      await authApi.resendVerification(email.trim());
      setView("resent");
    } catch (err) {
      const apiError = getApiError(err);
      if (apiError.status === 429) setView("wait");
      else setError(apiError.message);
    }
  };

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

      {view === "verifying" ? (
        <p role="status" className="text-[15px] text-muted">
          {loadError || "Verifying your email…"}
        </p>
      ) : view === "success" ? (
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