import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import AuthProvider from "@/features/auth/context/AuthProvider";
import { useAuth } from "@/features/auth/context/useAuth";
import router from "./router";

const SPLASH_MIN_MS = 900; // never flash the splash for just a moment
const SPLASH_FILL_MS = 300; // time for the bar to finish filling
const SPLASH_FADE_MS = 450; // keep in sync with the transition in index.html

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
    if (!el) return;

    // Freeze the bar where it is, then run it to 100% before leaving.
    const fill = el.querySelector(".bs-bar i");
    if (fill) {
      fill.style.transform = getComputedStyle(fill).transform;
      fill.style.animation = "none";
      void fill.offsetWidth; // commit the frozen state before transitioning
      fill.style.transition = `transform ${SPLASH_FILL_MS}ms ease-out`;
      fill.style.transform = "scaleX(1)";
    }

    const leave = setTimeout(
      () => el.classList.add("is-leaving"),
      SPLASH_FILL_MS + 100
    );
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
      <RouterProvider router={router} />
    </AuthProvider>
  );
}