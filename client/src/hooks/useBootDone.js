import { useEffect, useState } from "react";

const booting = () => document.documentElement.hasAttribute("data-booting");

export default function useBootDone() {
  const [done, setDone] = useState(() => !booting());

  useEffect(() => {
    if (done) return;
    if (!booting()) {
      setDone(true);
      return;
    }
    const on = () => setDone(true);
    window.addEventListener("splash-done", on);
    return () => window.removeEventListener("splash-done", on);
  }, [done]);

  return done;
}