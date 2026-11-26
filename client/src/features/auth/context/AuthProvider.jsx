import { useCallback, useEffect, useMemo, useState } from "react";
import { refreshSession, setAccessToken, setAuthFailureHandler } from "@/lib/api";
import { authChannel, broadcastAuth } from "@/lib/authChannel";
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

  // Log this tab out when another tab logs out.
  useEffect(() => {
    if (!authChannel) return;

    const onMessage = (e) => {
      if (e.data?.type === "logout") {
        setAccessToken(null);
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    authChannel.addEventListener("message", onMessage);
    return () => authChannel.removeEventListener("message", onMessage);
  }, []);

  const login = useCallback(async (credentials) => {
    const { accessToken, user } = await authApi.login(credentials);
    setAccessToken(accessToken);
    setUser(user);
    setStatus("authenticated");
    return user;
  }, []);

  const demoLogin = useCallback(async () => {
    const { accessToken, user } = await authApi.demoLogin();
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
      broadcastAuth("logout");
    }
  }, []);

  const verifyEmail = useCallback(async (token) => {
    const { accessToken, user } = await authApi.verifyEmail(token);
    setAccessToken(accessToken);
    setUser(user);
    setStatus("authenticated");
    return user;
  }, []);

  const completeOnboarding = useCallback(async () => {
    const user = await authApi.completeOnboarding();
    setUser(user); // onboarded_at is now set, so the guards let them through
    return user;
  }, []);

  const value = useMemo(
    () => ({ user, status, login, demoLogin, logout, verifyEmail, completeOnboarding }),
    [user, status, login, demoLogin, logout, verifyEmail, completeOnboarding]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}