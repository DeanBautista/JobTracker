import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/Button";
import Brand from "@/features/landing/components/shared/Brand";
import Container from "@/features/landing/components/shared/Container";
import { NAV_LINKS } from "@/features/landing/data/landingContent";

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/94 backdrop-blur-[6px]">
      <Container className="flex h-16 items-center gap-7">
        <Brand />

        <nav aria-label="Page sections" className="ml-3 hidden gap-[26px] text-[14.5px] md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} className="text-muted no-underline hover:text-ink">
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <Link
            to="/login"
            className="hidden px-1.5 text-sm underline-offset-3 hover:underline md:inline"
          >
            Log in
          </Link>
          <Button as={Link} to="/register" variant="primary" size="sm">
            Sign up free
          </Button>

          {/* Mobile menu */}
          <details
            className="group relative md:hidden"
            open={menuOpen}
            onToggle={(e) => setMenuOpen(e.currentTarget.open)}
          >
            <summary className="inline-flex min-h-[38px] cursor-pointer list-none items-center rounded-md border border-rule px-3.5 text-sm group-open:border-ink [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <ul className="absolute top-[46px] right-0 min-w-[210px] rounded-lg border border-ink bg-surface p-1.5">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href} className="border-rule not-first:border-t">
                  <a
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-sm px-3 py-[11px] text-[15px] no-underline hover:bg-tint"
                  >
                    {label}
                  </a>
                </li>
              ))}
              <li className="border-t border-rule">
                <Link to="/login" className="block rounded-sm px-3 py-[11px] text-[15px] no-underline hover:bg-tint">
                  Log in
                </Link>
              </li>
            </ul>
          </details>
        </div>
      </Container>
    </header>
  );
}