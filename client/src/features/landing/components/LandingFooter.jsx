import { Link } from "react-router-dom";
import Container from "@/features/landing/components/shared/Container";
import { FOOTER_LINKS } from "@/features/landing/data/landingContent";

const linkClass = "no-underline underline-offset-3 hover:text-ink hover:underline";

export default function LandingFooter() {
  return (
    <footer className="border-t border-rule pt-9 pb-11 text-sm text-muted">
      <Container className="flex flex-wrap justify-between gap-x-10 gap-y-5">
        <span>Job Tracker · Portfolio project</span>

        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_LINKS.map(({ label, to, href }) => (
            <li key={label}>
              {to ? (
                <Link to={to} className={linkClass}>{label}</Link>
              ) : (
                <a href={href} rel="noopener" className={linkClass}>{label}</a>
              )}
            </li>
          ))}
        </ul>

        <p className="basis-full border-t border-rule pt-5 font-mono text-xs leading-normal">
          Built with MySQL, OAuth 2.0 with PKCE, and private file storage.
        </p>
      </Container>
    </footer>
  );
}