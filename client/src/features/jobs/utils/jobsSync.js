import { useSyncExternalStore } from "react";

let version = 0;
const listeners = new Set();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Call after any change to jobs (archive, delete, restore, move, undo).
export const notifyJobsChanged = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

// Add the returned number to a fetch effect's dependencies to refetch on every change.
export const useJobsVersion = () => useSyncExternalStore(subscribe, () => version);