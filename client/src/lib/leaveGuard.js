// Lets code outside a page (such as Log out) ask that page before leaving.
let guard = null;
let forcedReload = false;

export function registerLeaveGuard(fn) {
  guard = fn;
  return () => {
    if (guard === fn) guard = null;
  };
}

// Runs the action right away, unless a page wants to confirm first.
export function confirmLeave(action) {
  if (guard) guard(action);
  else action();
}

export const isForcedReload = () => forcedReload;

// For reloads the user must not cancel, such as an account change.
export function forceReload() {
  forcedReload = true;
  window.location.reload();
}