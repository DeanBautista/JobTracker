import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AuthAltLinks from "../components/AuthAltLinks";
import AuthHeader from "../components/AuthHeader";
import AuthLayout from "../components/AuthLayout";
import OrDivider from "../components/OrDivider";
import SignInForm from "../components/signin/SignInForm.jsx";
import SignInStatus from "../components/signin/SignInStatus";
import SignInStory from "../components/signin/SignInStory";
import SocialButtons from "../components/SocialButtons";

const OAUTH_ERRORS = {
  oauth_denied: "Sign-in was cancelled.",
  oauth_email_unverified:
    "Your account has no verified email. Verify it with the provider, then try again.",
  oauth_failed: "Couldn't sign you in. Please try again.",
};

export default function SignInPage() {

  const [status, setStatus] = useState(null); // null | "error" | "locked"
  const [params] = useSearchParams();
  const oauthError = OAUTH_ERRORS[params.get("error")];

  return (
    <AuthLayout
      story={<SignInStory />}
      storyNote="Illustrative data for preview purposes."
    >
      <AuthHeader
        title="Log in"
        description="Use the email and password you signed up with, or continue with Google or GitHub."
      />

      {oauthError && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {oauthError}
        </p>
      )}
      
      <SignInStatus status={status} />
      <SignInForm status={status} onStatusChange={setStatus} />

      <OrDivider />
      <SocialButtons />

      <AuthAltLinks
        prompt="New here?"
        linkLabel="Create a free account"
        to="/register"
      />
    </AuthLayout>
  );
}