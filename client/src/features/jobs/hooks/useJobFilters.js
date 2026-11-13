import { useSearchParams } from "react-router-dom";
import { FILTER_KEYS, FILTER_LABELS, filterValueLabel } from "../utils/jobOptions";

export default function useJobFilters() {
  const [params, setParams] = useSearchParams();

  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key) ?? ""]));
  const sort = params.get("sort") ?? "applied";
  const dir = params.get("dir") ?? "desc";
  const page = Number(params.get("page")) || 1;
  const size = Number(params.get("size")) || 10;

  const activeFilters = FILTER_KEYS.filter((key) => filters[key]).map((key) => ({
    key,
    text: `${FILTER_LABELS[key]}: ${filterValueLabel(key, filters[key])}`,
  }));

  // Empty value removes the param
  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setParams(next);
  };

  const applyFilters = (values) => {
    const cleared = Object.fromEntries(FILTER_KEYS.map((key) => [key, ""]));
    update({ ...cleared, ...values, page: "" });
  };

  const removeFilter = (key) => update({ [key]: "", page: "" });
  const clearFilters = () => applyFilters({});

  const toggleSort = (key) =>
    update({ sort: key, dir: sort === key && dir === "asc" ? "desc" : "asc", page: "" });

  const setPage = (n) => update({ page: n > 1 ? String(n) : "" });
  const setSize = (n) => update({ size: n === 10 ? "" : String(n), page: "" });

  return {
    filters, activeFilters, sort, dir, page, size,
    applyFilters, removeFilter, clearFilters, toggleSort, setPage, setSize,
  };
}