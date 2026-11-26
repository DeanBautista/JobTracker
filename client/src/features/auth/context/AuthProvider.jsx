import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  refreshSession,
  setAccessToken,
  setAuthFailureHandler,
  setExpectedUserId,
} from "@/lib/api";
import { authChannel, broadcastAuth } from "@/lib/authChannel";
import * as authApi from "../api/authApi";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "authenticated" | "unauthenticated"

  // Latest values for the channel listener, which is registered once.
  const userRef = useRef(null);
  const statusRef = useRef("loading");

  useEffect(() => {
    userRef.current = user;
    statusRef.current = status;
    setExpectedUserId(user?.id ?? null);
  }, [user, status]);

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
        // Covers OAuth, which lands here after a full-page redirect.
        // Tabs already signed in as this user ignore it.
        broadcastAuth("login", { userId: user.id });
      })
      .catch(() => {
        if (!active) return;
        setStatus("unauthenticated");
      });

    return () => {
      active = false;
    };
  }, []);

  // Keep this tab in sync with login/logout in other tabs.
  useEffect(() => {
    if (!authChannel) return;

    const onMessage = (e) => {
      const { type, userId } = e.data || {};

      if (type === "logout") {
        setAccessToken(null);
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      if (type === "login") {
        if (statusRef.current === "loading") return; // already restoring from the cookie
        const current = userRef.current;
        // Signed out here, or signed in as someone else: re-sync from the cookie.
        if (!current || String(current.id) !== String(userId)) {
          window.location.reload();
        }
      }
    };

    authChannel.addEventListener("message", onMessage);
    return () => authChannel.removeEventListener("message", onMessage);
  }, []);

  const signIn = useCallback(({ accessToken, user }) => {
    setAccessToken(accessToken);
    setUser(user);
    setStatus("authenticated");
    broadcastAuth("login", { userId: user.id });
    return user;
  }, []);

  const login = useCallback(
    async (credentials) => signIn(await authApi.login(credentials)),
    [signIn]
  );

  const demoLogin = useCallback(
    async () => signIn(await authApi.demoLogin()),
    [signIn]
  );

  const verifyEmail = useCallback(
    async (token) => signIn(await authApi.verifyEmail(token)),
    [signIn]
  );

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