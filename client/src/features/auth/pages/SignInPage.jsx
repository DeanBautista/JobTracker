import { useState } from "react";
import AuthAltLinks from "../components/AuthAltLinks";
import AuthHeader from "../components/AuthHeader";
import AuthLayout from "../components/AuthLayout";
import OrDivider from "../components/OrDivider";
import SignInForm from "../components/signin/SignInForm.jsx";
import SignInStatus from "../components/signin/SignInStatus";
import SignInStory from "../components/signin/SignInStory";
import SocialButtons from "../components/SocialButtons";

export default function SignInPage() {

  const [status, setStatus] = useState(null); // null | "error" | "locked"

  return (
    <AuthLayout
      story={<SignInStory />}
      storyNote="Illustrative data for preview purposes."
    >
      <AuthHeader
        title="Log in"
        description="Use the email and password you signed up with, or continue with Google or GitHub."
      />

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