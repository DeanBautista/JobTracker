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