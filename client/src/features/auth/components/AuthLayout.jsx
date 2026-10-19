import Brand from "./Brand";

// Two-column shell shared by the auth pages:
// a dark story panel on the left (hidden on small screens) and the form on the right.
export default function AuthLayout({ story, storyNote, topAction, children }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-on-ink"
      >
        Skip to content
      </a>

      <div className="grid min-h-screen min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* Story panel */}
        <aside className="hidden flex-col justify-between gap-12 bg-ink px-story-gutter py-9 text-on-ink min-[900px]:flex">
          <Brand />
          {story}
          <p className="font-mono text-xs leading-snug text-on-ink/55">
            {storyNote}
          </p>
        </aside>

        {/* Form panel */}
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center justify-between gap-4 px-gutter pt-7 text-[14.5px] text-muted">
            <Brand className="text-ink min-[900px]:hidden" />
            <span className="ml-auto">{topAction}</span>
          </div>

          <main
            id="main"
            className="flex flex-1 items-start justify-center px-gutter pb-8 pt-9 min-[900px]:items-center min-[900px]:pt-8"
          >
            <div className="w-full max-w-[400px]">{children}</div>
          </main>

          <footer className="flex flex-wrap gap-x-6 gap-y-2 px-gutter pb-7 text-[13.5px] text-muted">
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="mailto:hello@example.com">Contact</FooterLink>
          </footer>
        </div>
      </div>
    </>
  );
}

function FooterLink({ href, children }) {
  return (
    <a
      href={href}
      className="hover:text-ink hover:underline hover:underline-offset-[3px]"
    >
      {children}
    </a>
  );
}