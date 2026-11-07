import { useCallback, useEffect, useMemo, useState } from "react";
import { refreshSession, setAccessToken, setAuthFailureHandler } from "@/lib/api";
import * as authApi from "../api/authApi";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "authenticated" | "unauthenticated"

  // Restore the session on page load from the refresh cookie.
  useEffect(() => {
    let active = true;

    setAuthFailureHandler(() => {
      setUser(null);
      setStatus("unauthenticated");
    });

    refreshSession()
      .then(({ user }) => {
        if (!active) return;
        setUser(user);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!active) return;
        setStatus("unauthenticated");
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { accessToken, user } = await authApi.login(credentials);
    setAccessToken(accessToken);
    setUser(user);
    setStatus("authenticated");
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      // Clear locally even if the request failed
      setAccessToken(null);
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo(
    () => ({ user, status, login, logout }),
    [user, status, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}