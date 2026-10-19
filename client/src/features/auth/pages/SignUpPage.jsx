import AuthAltLinks from "../components/AuthAltLinks";
import AuthHeader from "../components/AuthHeader";
import AuthLayout from "../components/AuthLayout";
import OrDivider from "../components/OrDivider";
import SignUpForm from "../components/signup/SignUpForm";
import SignUpStory from "../components/signup/SignUpStory";
import SocialButtons from "../components/SocialButtons";

export default function SignUpPage() {
  return (
    <AuthLayout story={<SignUpStory />} storyNote="No credit card.">
      <AuthHeader
        title="Create your account"
        description="Sign up with your email, or continue with Google or GitHub."
      />

      <SignUpForm />

      <OrDivider />
      <SocialButtons />

      <AuthAltLinks
        prompt="Already registered?"
        linkLabel="Log in"
        to="/login"
      />
    </AuthLayout>
  );
}