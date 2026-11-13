import { useState } from "react";

export default function useJobSelection(jobs) {
  const [selected, setSelected] = useState(() => new Set());

  // Only count rows on the current page
  const selectedIds = jobs.filter((job) => selected.has(job.id)).map((job) => job.id);
  const allSelected = jobs.length > 0 && selectedIds.length === jobs.length;

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(jobs.map((job) => job.id)));
  const clear = () => setSelected(new Set());

  return { selected, selectedIds, allSelected, toggle, toggleAll, clear };
}