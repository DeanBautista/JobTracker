import { useState } from "react";
import ActiveFilters from "../components/list/ActiveFilters";
import BulkBar from "../components/list/BulkBar";
import JobFilters from "../components/list/JobFilters";
import JobsFooter from "../components/list/JobsFooter";
import JobsHeader from "../components/list/JobsHeader";
import JobsSkeleton from "../components/list/JobsSkeleton";
import JobsTable from "../components/list/JobsTable";
import ListState from "../components/list/ListState";
import useJobFilters from "../hooks/useJobFilters";
import useJobSelection from "../hooks/useJobSelection";
import useJobs from "../hooks/useJobs";
import { DEFAULT_VISIBLE_COLUMNS } from "../utils/jobOptions";

// Placeholders until the API exists. Every action takes an array of job ids.
const actions = {
  moveStage: (ids, stage) => console.info("move", ids, stage),
  archive: (ids) => console.info("archive", ids),
  remove: (ids) => console.info("delete", ids),
  exportSelection: (ids) => console.info("export", ids),
};

export default function JobsListPage() {
  const {
    filters, activeFilters, sort, dir, page, size,
    applyFilters, removeFilter, clearFilters, toggleSort, setPage, setSize,
  } = useJobFilters();

  const { status, jobs, total } = useJobs({ filters, sort, dir, page, size });
  const selection = useJobSelection(jobs);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);

  const hasFilters = activeFilters.length > 0;
  const showList = status === "success" && total > 0;

  const toggleColumn = (key) => setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      <JobsHeader total={total} hasFilters={hasFilters} sort={sort} dir={dir} />

      {status === "loading" && <JobsSkeleton />}
      {status === "error" && <ListState variant="error" />}
      {status === "success" && total === 0 && (
        <ListState variant={hasFilters ? "none" : "empty"} />
      )}

      {showList && (
        <>
          <JobFilters filters={filters} onApply={applyFilters} />
          <ActiveFilters
            activeFilters={activeFilters}
            onRemove={removeFilter}
            onClear={clearFilters}
            visibleColumns={visibleColumns}
            onToggleColumn={toggleColumn}
          />

          <JobsTable
            jobs={jobs}
            visible={visibleColumns}
            sort={sort}
            dir={dir}
            onSort={toggleSort}
            selection={selection}
            actions={actions}
          />

          {selection.selectedIds.length > 0 && (
            <BulkBar
              count={selection.selectedIds.length}
              onMove={(stage) => actions.moveStage(selection.selectedIds, stage)}
              onArchive={() => actions.archive(selection.selectedIds)}
              onDelete={() => actions.remove(selection.selectedIds)}
              onExport={() => actions.exportSelection(selection.selectedIds)}
              onClear={selection.clear}
            />
          )}

          <JobsFooter
            total={total}
            page={page}
            size={size}
            onPageChange={setPage}
            onSizeChange={setSize}
          />
        </>
      )}
    </>
  );
}