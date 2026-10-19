import Button from "@/components/Button";
import FormField from "@/components/FormField";
import Input from "@/components/Input";
import TextLink from "@/components/TextLink";
import PasswordInput from "../PasswordInput";

// UI only. `invalid` turns both fields red (used for "Email or password is incorrect").
export default function SignInForm({ invalid = false }) {
  // Stops the page from reloading until a real submit handler exists.
  const handleSubmit = (event) => event.preventDefault();

  return (
    <form onSubmit={handleSubmit} className="mt-6.5">
      <div className="space-y-4.5">
        <FormField id="email" label="Email">
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            required
            invalid={invalid}
          />
        </FormField>

        <FormField
          id="password"
          label="Password"
          aside={<TextLink to="/forgot-password">Forgot password?</TextLink>}
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            maxLength={128}
            required
            invalid={invalid}
          />
        </FormField>
      </div>

      <Button type="submit" variant="primary" fullWidth className="mt-5.5">
        Log in
      </Button>
    </form>
  );
}