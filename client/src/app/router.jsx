import { createBrowserRouter, Navigate } from "react-router-dom";
import { SignInPage, SignUpPage, ForgotPasswordPage } from "@/features/auth";
import { GuestRoute, ProtectedRoute } from "@/features/auth/components/RouteGuards";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
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