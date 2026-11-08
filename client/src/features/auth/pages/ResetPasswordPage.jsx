import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "@/features/auth/components/AuthLayout";
import ResetPasswordForm from "@/features/auth/components/resetpassword/ResetPasswordForm";
import InvalidResetLink from "@/features/auth/components/resetpassword/InvalidResetLink";
import ResetPasswordStory from "@/features/auth/components/resetpassword/ResetPasswordStory";

// UI only: the link counts as invalid when the token is missing.
// Once the API exists, also show InvalidResetLink when the server rejects the token.
export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token");

  return (
    <AuthLayout story={<ResetPasswordStory />} storyNote="Sample data">
      <Link
        to="/login"
        className="mb-7 inline-flex text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        Back to log in
      </Link>

      {token ? <ResetPasswordForm token={token} /> : <InvalidResetLink />}
    </AuthLayout>
  );
}