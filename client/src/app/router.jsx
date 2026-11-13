import { createBrowserRouter, Navigate } from "react-router-dom";
import {
  SignInPage,
  SignUpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "@/features/auth";
import { GuestRoute, ProtectedRoute } from "@/features/auth/components/RouteGuards";
import AppShell from "@/components/AppShell";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import { JobsListPage } from "@/features/jobs";
import { JobDetailPage } from "@/features/job-detail";

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
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/jobs", element: <JobsListPage /> },
          { path: "/job/:id", element: <JobDetailPage /> },
        ],
      },
    ],
  },
]);

export default router;