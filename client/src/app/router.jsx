import { createBrowserRouter, Navigate } from "react-router-dom";
import { SignInPage, SignUpPage } from "@/features/auth";
import { ForgotPasswordPage } from "@/features/auth";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/register" replace /> },
  { path: "/register", element: <SignUpPage /> },
  { path: "/login", element: <SignInPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> }
]);

export default router;