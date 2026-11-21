import { useLocation } from "react-router-dom";

// Where the job was opened from. A direct URL has no state, so it falls back to List.
export default function useJobOrigin() {
  const { state } = useLocation();
  return state?.from === "board" ? { label: "Board", to: "/board" } : { label: "List", to: "/jobs" };
}