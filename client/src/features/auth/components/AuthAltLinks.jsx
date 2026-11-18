import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TextLink from "@/components/TextLink";
import { useAuth } from "../context/useAuth";
import { getApiError } from "@/lib/api";

export default function AuthAltLinks({ prompt, linkLabel, to }) {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDemo = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await demoLogin();
      navigate(location.state?.from?.pathname ?? "/dashboard", { replace: true });
    } catch (err) {
      setError(getApiError(err).message);
      setLoading(false);
    }
  };

  return (
    <div className="mt-6.5 grid gap-2 border-t border-rule pt-5.5 text-[14.5px]">
      <p>
        <span className="text-muted">Just looking around?</span>{" "}
        <button
          type="button"
          onClick={handleDemo}
          disabled={loading}
          className="cursor-pointer underline decoration-1 underline-offset-[3px] hover:decoration-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Try the demo account"}
        </button>
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <p>
        <span className="text-muted">{prompt}</span>{" "}
        <TextLink to={to}>{linkLabel}</TextLink>
      </p>
    </div>
  );
}