import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

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
    code: data.code ?? "unknown_error",
    message: data.message ?? "Something went wrong. Please try again.",
    fields: data.fields ?? {},
  };
}