import { api } from "@/lib/api";

export async function register({ name, email, password }) {
  const { data } = await api.post("/users", { name, email, password });
  return data;
}

export async function login({ email, password }) {
  const { data } = await api.post(
    "/auth/login",
    { email, password },
    { skipAuthRefresh: true }
  );
  return data; // { accessToken, user }
}

export async function logout() {
  await api.post("/auth/logout", {}, { skipAuthRefresh: true });
}

export async function verifyEmail(token) {
  const { data } = await api.post(
    "/auth/verify-email",
    { token },
    { skipAuthRefresh: true }
  );
  return data; // { accessToken, user }
}

export async function resendVerification(email) {
  await api.post("/auth/resend-verification", { email }, { skipAuthRefresh: true });
}

export async function forgotPassword(email) {
  await api.post("/auth/forgot-password", { email }, { skipAuthRefresh: true });
}

export async function resetPassword({ token, password }) {
  await api.post("/auth/reset-password", { token, password }, { skipAuthRefresh: true });
}