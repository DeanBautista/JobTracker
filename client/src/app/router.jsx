import { createBrowserRouter, Navigate } from "react-router-dom";
import { SignUpPage } from "@/features/auth";

// Route definitions
const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/register" replace /> },
  { path: "/register", element: <SignUpPage /> },
]);

export default router;