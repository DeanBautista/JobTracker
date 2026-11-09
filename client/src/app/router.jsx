import { createBrowserRouter, Navigate } from "react-router-dom";
import {
  SignInPage,
  SignUpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "@/features/auth";
import { GuestRoute, ProtectedRoute } from "@/features/auth/components/RouteGuards";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },

  // Outside GuestRoute on purpose: verifying signs the user in, and GuestRoute
  // would redirect them to the dashboard before the success screen shows.
  { path: "/verify-email", element: <VerifyEmailPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },

  {
    element: <GuestRoute />,
    children: [
      { path: "/register", element: <SignUpPage /> },
      { path: "/login", element: <SignInPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/dashboard", element: <DashboardPage /> }],
  },
]);

export default router;