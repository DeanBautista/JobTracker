import Button from "@/components/Button";

export default function SocialButtons() {
  return (
    <div className="grid gap-2.5">
      <Button as="a" href="/auth/google" fullWidth>
        <GoogleIcon />
        Continue with Google
      </Button>

      <Button as="a" href="/auth/github" fullWidth>
        <GitHubIcon />
        Continue with GitHub
      </Button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9 .3a8.7 8.7 0 0 0-2.75 16.95c.44.08.6-.19.6-.42v-1.5c-2.43.53-2.95-1.17-2.95-1.17-.4-1.01-.97-1.28-.97-1.28-.79-.54.06-.53.06-.53.88.06 1.34.9 1.34.9.78 1.33 2.04.95 2.54.72.08-.57.3-.95.55-1.17-1.94-.22-3.98-.97-3.98-4.31 0-.95.34-1.73.9-2.34-.09-.22-.39-1.11.09-2.31 0 0 .73-.23 2.4.9a8.3 8.3 0 0 1 4.37 0c1.67-1.13 2.4-.9 2.4-.9.48 1.2.18 2.09.09 2.31.56.61.9 1.39.9 2.34 0 3.35-2.05 4.09-4 4.3.31.27.59.8.59 1.62v2.4c0 .23.16.5.6.42A8.7 8.7 0 0 0 9 .3z"
      />
    </svg>
  );
}