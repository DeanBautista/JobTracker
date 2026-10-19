import Button from "@/components/Button";
import FormField from "@/components/FormField";
import Input from "@/components/Input";
import StatusMessage from "@/components/StatusMessage";
import TextLink from "@/components/TextLink";
import BackLink from "./BackLink";

export default function ForgotPasswordForm({
  email,
  onEmailChange,
  onSubmit,
  isRateLimited = false,
  error = "",
}) {
  return (
    <div>
      <BackLink to="/signin">Back to log in</BackLink>

      <h1 className="font-serif text-[clamp(2rem,3.4vw,2.6rem)] leading-[1.08] tracking-tight">
        Forgot your password?
      </h1>
      <p className="mt-2.5 text-muted">
        Enter your email and we will send you a link to choose a new one.
      </p>

      {isRateLimited && (
        <StatusMessage variant="info" title="Please wait a minute.">
          We already sent a link a moment ago. Check your inbox and spam folder,
          then try again.
        </StatusMessage>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-6.5">
        <FormField id="email" label="Email" error={error}>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            required
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            hasError={Boolean(error)}
          />
        </FormField>

        <Button type="submit" fullWidth className="mt-5.5">
          Send reset link
        </Button>
      </form>

      <div className="mt-6.5 grid gap-2 border-t border-rule pt-5.5 text-[14.5px]">
        <p>
          <span className="text-muted">Remembered it?</span>{" "}
          <TextLink to="/signin">Log in</TextLink>
        </p>
        <p>
          <span className="text-muted">Wrong email, or new here?</span>{" "}
          <TextLink to="/signup">Create a free account</TextLink>
        </p>
      </div>
    </div>
  );
}