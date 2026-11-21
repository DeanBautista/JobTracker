import { createBrowserRouter } from "react-router-dom";
import {
  SignInPage,
  SignUpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "@/features/auth";
import {
  GuestRoute,
  ProtectedRoute,
  OnboardedRoute,
  OnboardingRoute,
} from "@/features/auth/components/RouteGuards";
import AppShell from "@/components/AppShell";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import { JobsListPage } from "@/features/jobs";
import { JobDetailPage } from "@/features/job-detail";
import { OnboardingPage } from "@/features/onboarding";
import { LandingPage } from "@/features/landing";
import { BoardPage } from "@/features/board";
import { TrashPage } from "@/features/trash";

const router = createBrowserRouter([
  // { path: "/", element: <Navigate to="/dashboard" replace /> },

  // Outside GuestRoute on purpose: verifying signs the user in, and GuestRoute
  // would redirect them to the dashboard before the success screen shows.
  { path: "/verify-email", element: <VerifyEmailPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },

  {
    element: <GuestRoute />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/register", element: <SignUpPage /> },
      { path: "/login", element: <SignInPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <OnboardingRoute />,
        children: [{ path: "/onboarding", element: <OnboardingPage /> }],
      },
      {
        element: <OnboardedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: "/dashboard", element: <DashboardPage /> },
              { path: "/jobs", element: <JobsListPage /> },
              { path: "/board", element: <BoardPage /> },
              { path: "/jobs/:id", element: <JobDetailPage /> },
              { path: "trash", element: <TrashPage /> }
            ],
          },
        ],
      },
    ],
  },
]);

export default router;