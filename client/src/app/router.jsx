import { createBrowserRouter, Navigate } from "react-router-dom";
import { SignInPage, SignUpPage } from "@/features/auth";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/register" replace /> },
  { path: "/register", element: <SignUpPage /> },
  { path: "/login", element: <SignInPage /> },
]);

export default router;