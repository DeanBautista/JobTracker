const EVENT = "jobs:changed";

export const notifyJobsChanged = () => window.dispatchEvent(new Event(EVENT));

export const onJobsChanged = (handler) => {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
};