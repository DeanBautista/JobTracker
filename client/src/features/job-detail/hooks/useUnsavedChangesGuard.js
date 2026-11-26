import { useCallback, useEffect, useState } from "react";
import { useBlocker } from "react-router-dom";
import { isForcedReload, registerLeaveGuard } from "@/lib/leaveGuard";

export default function useUnsavedChangesGuard(when) {
  const [pendingAction, setPendingAction] = useState(null);

  // In-app navigation: links, Back and Forward.
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation, historyAction }) => {
        const skip = historyAction !== "POP" && nextLocation.state?.skipLeaveGuard;
        // Same pathname means only the tab changed.
        return when && !skip && currentLocation.pathname !== nextLocation.pathname;
      },
      [when],
    ),
  );

  // Closing or refreshing the page, or going to another site.
  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (e) => {
      if (isForcedReload()) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [when]);

  // Actions that aren't navigation, such as Log out.
  useEffect(() => {
    if (!when) return;
    return registerLeaveGuard((action) => setPendingAction(() => action));
  }, [when]);

  const open = blocker.state === "blocked" || pendingAction !== null;

  const stay = () => {
    setPendingAction(null);
    if (blocker.state === "blocked") blocker.reset();
  };

  const leave = () => {
    if (pendingAction) {
      setPendingAction(null);
      pendingAction();
    } else if (blocker.state === "blocked") {
      blocker.proceed();
    }
  };

  // If a save finishes while the dialog is open, continue automatically.
  useEffect(() => {
    if (!when && open) leave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [when, open]);

  return { open, stay, leave };
}