import Button from "@/components/Button";
import FormField from "@/components/FormField";
import Input from "@/components/Input";
import TextLink from "@/components/TextLink";
import PasswordInput from "./PasswordInput";

// UI only. To preview the error state, pass messages in, e.g.
// <SignUpForm errors={{ name: "Enter your name." }} />
export default function SignUpForm({ errors = {} }) {
  // Stops the page from reloading until a real submit handler exists.
  const handleSubmit = (event) => event.preventDefault();

  return (
    <form onSubmit={handleSubmit} className="mt-6.5">
      <div className="space-y-4.5">
        <FormField id="name" label="Name" error={errors.name}>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={80}
            required
            error={errors.name}
          />
        </FormField>

        <FormField id="email" label="Email" error={errors.email}>
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
            error={errors.email}
          />
        </FormField>

        <FormField
          id="password"
          label="Password"
          hint="At least 8 characters."
          error={errors.password}
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
            aria-describedby="password-hint"
            error={errors.password}
          />
        </FormField>
      </div>

      <Button type="submit" variant="primary" fullWidth className="mt-5.5">
        Create account
      </Button>

      <p className="mt-4 text-[13.5px] text-muted">
        By creating an account you agree to the{" "}
        <TextLink to="/terms">Terms</TextLink> and{" "}
        <TextLink to="/privacy">Privacy Policy</TextLink>.
      </p>
    </form>
  );
}