export const authChannel =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("auth") : null;

export const broadcastAuth = (type) => authChannel?.postMessage({ type });