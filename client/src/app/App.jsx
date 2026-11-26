import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import AuthProvider from "@/features/auth/context/AuthProvider";
import { useAuth } from "@/features/auth/context/useAuth";
import ToastProvider from "@/context/ToastProvider";
import router from "./router";

const SPLASH_MIN_MS = 900; // never flash the splash for just a moment
const SPLASH_FILL_MS = 300; // time for the bar to finish filling
const SPLASH_FADE_MS = 450; // keep in sync with the transition in index.html

// 1. Reloading the tab shouldn't replay the splash.
const navType = performance.getEntriesByType?.("navigation")?.[0]?.type;
if (navType === "reload") {
  document.getElementById("boot-splash")?.remove();
}

// 2. Hold page animations only if a splash is actually on screen.
function splashVisible() {
  const el = document.getElementById("boot-splash");
  if (!el) return false;
  const s = getComputedStyle(el);
  return s.display !== "none" && s.visibility !== "hidden" && s.opacity !== "0";
}

if (splashVisible()) {
  document.documentElement.dataset.booting = "true";
}

function releaseBoot() {
  if (!document.documentElement.hasAttribute("data-booting")) return;
  delete document.documentElement.dataset.booting;
  window.dispatchEvent(new Event("splash-done"));
}

// Fades out the static splash in index.html once auth has finished loading
// and the minimum display time has passed.
function SplashGate() {
  const { status } = useAuth();
  const [minDone, setMinDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status === "loading" || !minDone) return;

    try {
      sessionStorage.setItem("splash-seen", "1");
    } catch {
      /* storage blocked, splash will just play again next time */
    }

    const el = document.getElementById("boot-splash");
    if (!el) {
      releaseBoot();
      return;
    }

    // Freeze the bar where it is, then run it to 100% before leaving.
    const fill = el.querySelector(".bs-bar i");
    if (fill) {
      fill.style.transform = getComputedStyle(fill).transform;
      fill.style.animation = "none";
      void fill.offsetWidth; // commit the frozen state before transitioning
      fill.style.transition = `transform ${SPLASH_FILL_MS}ms ease-out`;
      fill.style.transform = "scaleX(1)";
    }

    const leave = setTimeout(() => {
      el.classList.add("is-leaving");
      releaseBoot(); // animations start as the splash fades
    }, SPLASH_FILL_MS + 100);

    const remove = setTimeout(
      () => el.remove(),
      SPLASH_FILL_MS + 100 + SPLASH_FADE_MS + 50
    );

    return () => {
      clearTimeout(leave);
      clearTimeout(remove);
    };
  }, [status, minDone]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <SplashGate />
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
}