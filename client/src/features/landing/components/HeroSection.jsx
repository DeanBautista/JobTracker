import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import Reveal from "@/components/Reveal";
import BoardPreview from "./BoardPreview";
import Container from "@/features/landing/components/shared/Container";
import { useAuth } from "@/features/auth/context/useAuth";
import { getApiError } from "@/lib/api";

export default function HeroSection() {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDemo = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await demoLogin();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getApiError(err).message);
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="hero-title" className="pt-[clamp(40px,7vw,88px)] pb-[clamp(40px,6vw,72px)]">
      <Container className="grid items-center gap-[clamp(32px,5vw,72px)] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <Reveal>
          <h1
            id="hero-title"
            className="font-serif text-[length:clamp(2.5rem,5.4vw,4.3rem)] leading-[1.04] font-normal tracking-[-0.025em] text-balance"
          >
            Know where every application <em className="text-accent italic">stands.</em>
          </h1>
          <p className="mt-[22px] max-w-[44ch] text-lg leading-[1.55] text-muted">
            Add jobs, move them across a board, keep the resume and cover letter you sent with each one, and get
            reminded before anything goes cold.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button as="a" href="#signup" variant="primary">
              Create free account
            </Button>
            <Button onClick={handleDemo} disabled={loading}>
              {loading ? "Signing in..." : "Try the demo account"}
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted">No credit card. Sign in with email, Google or GitHub.</p>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </Reveal>

        <BoardPreview />
      </Container>
    </section>
  );
}