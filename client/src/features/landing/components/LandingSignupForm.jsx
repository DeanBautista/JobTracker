import Button from "../../../components/Button";
import Input from "../../../components/Input";
import TextLink from "../../../components/TextLink";
import ProviderButtons from "./ProviderButtons";

// Label + input + optional hint. Swap for FormField if it fits.
function TextField({ id, label, hint, ...inputProps }) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <Input id={id} aria-describedby={hintId} {...inputProps} />
      {hint && (
        <p id={hintId} className="mt-1.5 text-[13px] text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

export default function LandingSignupForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to the same signup logic the /register page uses
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[10px] bg-paper p-[clamp(22px,3vw,32px)] text-ink">
      <h3 className="mb-5 font-serif text-[1.35rem] leading-[1.2] font-medium">Create your account</h3>

      <TextField id="landing-name" name="name" type="text" label="Name" autoComplete="name" required maxLength={80} />
      <TextField id="landing-email" name="email" type="email" label="Email" autoComplete="email" required maxLength={254} />
      <TextField
        id="landing-password"
        name="password"
        type="password"
        label="Password"
        hint="At least 8 characters."
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
      />

      <Button type="submit" variant="primary" fullWidth>
        Create account
      </Button>

      <div
        aria-hidden="true"
        className="my-[18px] flex items-center gap-3 font-mono text-xs leading-none tracking-[0.08em] text-muted uppercase before:flex-1 before:border-t before:border-rule after:flex-1 after:border-t after:border-rule"
      >
        or
      </div>

      <ProviderButtons />

      <p className="mt-4 text-[13px] text-muted">
        By creating an account you agree to the <TextLink to="/terms">Terms</TextLink> and{" "}
        <TextLink to="/privacy">Privacy Policy</TextLink>.
      </p>
      <p className="mt-4 border-t border-rule pt-4 text-sm">
        Already have an account? <TextLink to="/login">Log in</TextLink> ·{" "}
        <TextLink to="/forgot-password">Forgot password</TextLink>
      </p>
    </form>
  );
}