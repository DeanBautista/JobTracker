import { useEffect, useState } from "react";
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
import CloseReasonDialog from "../components/shared/CloseReasonDialog";
import useJobActions from "../hooks/useJobActions";
import { DEFAULT_VISIBLE_COLUMNS } from "../utils/jobOptions";

export default function JobsListPage() {
  const {
    filters, activeFilters, sort, dir, page, size,
    applyFilters, removeFilter, clearFilters, toggleSort, setPage, setSize,
  } = useJobFilters();

  const { status, jobs, total, retry, reload } = useJobs({ filters, sort, dir, page, size });
  const selection = useJobSelection(jobs);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);

  const { actions, pendingMove, confirmMove, cancelMove } = useJobActions({
    jobs,
    reload,
    clearSelection: selection.clear,
  });

  const hasFilters = activeFilters.length > 0;
  const showFilters = status === "success" && (total > 0 || hasFilters);
  const showList = status === "success" && total > 0;

  const toggleColumn = (key) => setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));

  // If the last row of the last page was removed, step back to the new last page.
  useEffect(() => {
    if (status === "success" && jobs.length === 0 && total > 0 && page > 1) {
      setPage(Math.ceil(total / size));
    }
  }, [status, jobs.length, total, page, size, setPage]);

  return (
    <>
      <JobsHeader total={total} hasFilters={hasFilters} sort={sort} dir={dir} />

      {showFilters && (
        <>
          <JobFilters filters={filters} onApply={applyFilters} />
          <ActiveFilters
            activeFilters={activeFilters}
            onRemove={removeFilter}
            onClear={clearFilters}
            visibleColumns={visibleColumns}
            onToggleColumn={toggleColumn}
            onExport={() => actions.exportFiltered({ ...filters, sort, dir }, total)}
            exportDisabled={total === 0}
          />
        </>
      )}

      {status === "loading" && <JobsSkeleton />}
      {status === "error" && <ListState variant="error" onRetry={retry} />}
      {status === "success" && total === 0 && (
        <ListState variant={hasFilters ? "none" : "empty"} />
      )}

      {showList && (
        <>
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

      {pendingMove && (
        <CloseReasonDialog
          job={jobs.find((j) => j.id === pendingMove.ids[0])}
          count={pendingMove.ids.length}
          stage={pendingMove.stage}
          onConfirm={confirmMove}
          onCancel={cancelMove}
        />
      )}
    </>
  );
}