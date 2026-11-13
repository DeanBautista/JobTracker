import { useSearchParams } from "react-router-dom";
import { JOB_TABS } from "../utils/detailOptions";

const KEYS = JOB_TABS.map((t) => t.key);

// Active tab lives in the URL: /jobs/101?tab=notes. Unknown values fall back to overview.
export default function useJobTab() {
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const tab = KEYS.includes(raw) ? raw : "overview";

  const setTab = (key) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", key);
      return next;
    });

  return [tab, setTab];
}
