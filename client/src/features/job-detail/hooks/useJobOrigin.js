import { useLocation } from "react-router-dom";

// Where the job was opened from. A direct URL has no state, so it falls back to List.
// List and Archive & Trash pass their full URL, so Back returns to the same page and filters.
export default function useJobOrigin() {
  const { state } = useLocation();
  const from = state?.from;

  if (from === "board") return { label: "Board", to: "/board" };
  if (typeof from === "string" && from.startsWith("/trash")) return { label: "Archive & Trash", to: from };
  if (typeof from === "string" && from.startsWith("/jobs")) return { label: "List", to: from };
  return { label: "List", to: "/jobs" };
}