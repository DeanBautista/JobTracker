import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { MODE_LABELS, PRIORITY_LABELS } from "../utils/boardStages";

// Filters live in the URL (/board?q=acme&mode=remote&priority=high) so they survive
// refresh and can be shared. Mirrors the old GET /board form.
export default function useBoardFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      q: params.get("q") ?? "",
      mode: params.getAll("mode"),
      priority: params.getAll("priority"),
    }),
    [params],
  );
  const preview = import.meta.env.DEV ? params.get("preview") : null;

  const activeFilters = useMemo(() => {
    const list = [];
    if (filters.q.trim()) list.push({ id: "q", key: "q", label: `Search: ${filters.q.trim()}` });
    filters.mode.forEach((v) =>
      list.push({ id: `mode:${v}`, key: "mode", value: v, label: `Work mode: ${MODE_LABELS[v] ?? v}` }),
    );
    filters.priority.forEach((v) =>
      list.push({ id: `priority:${v}`, key: "priority", value: v, label: `Priority: ${PRIORITY_LABELS[v] ?? v}` }),
    );
    return list;
  }, [filters]);

  const write = useCallback(
    (next) => {
      const p = new URLSearchParams();
      if (next.q.trim()) p.set("q", next.q.trim());
      next.mode.forEach((v) => p.append("mode", v));
      next.priority.forEach((v) => p.append("priority", v));
      if (import.meta.env.DEV && params.get("preview")) p.set("preview", params.get("preview"));
      setParams(p);
    },
    [params, setParams],
  );

  const applyFilters = useCallback((next) => write(next), [write]);
  const clearFilters = useCallback(() => write({ q: "", mode: [], priority: [] }), [write]);
  const removeFilter = useCallback(
    (item) =>
      write(
        item.key === "q"
          ? { ...filters, q: "" }
          : { ...filters, [item.key]: filters[item.key].filter((v) => v !== item.value) },
      ),
    [filters, write],
  );

  return { filters, activeFilters, preview, applyFilters, clearFilters, removeFilter };
}
