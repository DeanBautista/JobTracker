import TextLink from "@/components/TextLink";
import AuthLayout from "../components/AuthLayout";
import OrDivider from "../components/OrDivider";
import SignUpForm from "../components/SignUpForm";
import SignUpStory from "../components/SignUpStory";
import SocialButtons from "../components/SocialButtons";

export default function SignUpPage() {
  return (
    <AuthLayout
      story={<SignUpStory />}
      storyNote="No credit card."
    >
      <h1 className="font-serif text-[clamp(2rem,3.4vw,2.6rem)] font-normal leading-[1.08] tracking-[-0.025em]">
        Create your account
      </h1>
      <p className="mt-2.5 text-muted">
        Sign up with your email, or continue with Google or GitHub.
      </p>

      <SignUpForm />

      <OrDivider />
      <SocialButtons />

      <div className="mt-6.5 grid gap-2 border-t border-rule pt-5.5 text-[14.5px]">
        <p>
          <span className="text-muted">Just looking around?</span>{" "}
          <TextLink to="/demo">Try the demo account</TextLink>
        </p>
        <p>
          <span className="text-muted">Already registered?</span>{" "}
          <TextLink to="/login">Log in</TextLink>
        </p>
      </div>
    </AuthLayout>
  );
}