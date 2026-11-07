import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

// Wraps pages that need a signed-in user.
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return null; // or a spinner
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

// Wraps login/register so signed-in users skip them.
export function GuestRoute() {
  const { status } = useAuth();

  if (status === "loading") return null;
  if (status === "authenticated") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}