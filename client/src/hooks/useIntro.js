import { useEffect, useState } from "react";
import useBootDone from "@/hooks/useBootDone";

// True until the first successful load has played its entrance animation.
export default function useIntro(ready, ms = 800) {
  const bootDone = useBootDone();
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    if (!ready || !bootDone) return;
    const t = setTimeout(() => setIntro(false), ms);
    return () => clearTimeout(t);
  }, [ready, bootDone, ms]);

  return intro;
}