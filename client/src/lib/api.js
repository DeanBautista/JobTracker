import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Access token lives in memory only. A page reload restores it via the refresh cookie.
let accessToken = null;
let onAuthFailure = () => {};

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setAuthFailureHandler = (handler) => {
  onAuthFailure = handler;
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// {} instead of null: a null body is sent as the text "null", which Express rejects.
const requestRefresh = () =>
  api.post("/auth/refresh", {}, { skipAuthRefresh: true });

// One refresh at a time. Concurrent callers (StrictMode's double effect, parallel
// 401s) share the same promise, so a rotated token is never replayed.
let refreshPromise = null;

export function refreshSession() {
  refreshPromise ??= (async () => {
    try {
      let response;
      try {
        response = await requestRefresh();
      } catch (err) {
        // Lost a race with another tab: it rotated the cookie, so retry once
        // with the new cookie the browser now holds.
        if (err.response?.data?.code !== "invalid_refresh_token") throw err;
        await wait(300);
        response = await requestRefresh();
      }
      accessToken = response.data.accessToken;
      return response.data;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status !== 401 ||
      !original ||
      original.skipAuthRefresh ||
      original._retried
    ) {
      return Promise.reject(error);
    }

    original._retried = true;
    try {
      await refreshSession();
    } catch (refreshError) {
      accessToken = null;
      onAuthFailure();
      return Promise.reject(refreshError);
    }

    original.headers.Authorization = `Bearer ${accessToken}`;
    return api(original);
  }
);

// Turns any axios failure into { status, code, message, fields }.
export function getApiError(error) {
  if (!error.response) {
    return {
      status: 0,
      code: "network_error",
      message: "Can't reach the server. Check your connection and try again.",
      fields: {},
    };
  }

  const { status, data } = error.response;

  return {
    status,
    code: data?.code ?? "unknown_error",
    message: data?.message ?? "Something went wrong. Please try again.",
    fields: data?.fields ?? data?.details ?? {},
  };
}