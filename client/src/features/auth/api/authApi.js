import { api } from "@/lib/api";

export async function register({ name, email, password }) {
  const { data } = await api.post("/users", { name, email, password });
  return data;
}