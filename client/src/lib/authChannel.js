export const authChannel =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("auth") : null;

export const broadcastAuth = (type, payload = {}) =>
  authChannel?.postMessage({ type, ...payload });