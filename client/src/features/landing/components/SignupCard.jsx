import TextLink from "@/components/TextLink";
import AuthAltLinks from "@/features/auth/components/AuthAltLinks";
import OrDivider from "@/features/auth/components/OrDivider";
import SocialButtons from "@/features/auth/components/SocialButtons";
import SignUpForm from "@/features/auth/components/signup/SignUpForm";

// Reuses the real auth pieces, so validation, submit and OAuth behave exactly
// like the /register page.
export default function SignupCard() {
  return (
    <div className="rounded-[10px] bg-paper p-[clamp(22px,3vw,32px)] text-ink">
      <h3 className="mb-5 font-serif text-[1.35rem] leading-[1.2] font-medium">Create your account</h3>

      <SignUpForm />

      <OrDivider />
      <SocialButtons />

      <p className="mt-4 text-[13px] text-muted">
        By creating an account you agree to the <TextLink to="/terms">Terms</TextLink> and{" "}
        <TextLink to="/privacy">Privacy Policy</TextLink>.
      </p>

      <AuthAltLinks prompt="Already registered?" linkLabel="Log in" to="/login" />
    </div>
  );
}