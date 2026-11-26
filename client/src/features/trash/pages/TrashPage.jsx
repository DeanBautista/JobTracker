import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useIntro from "@/hooks/useIntro";
import ConfirmDialog from "@/components/ConfirmDialog";
import JobsFooter from "@/features/jobs/components/list/JobsFooter";
import JobsSkeleton from "@/features/jobs/components/list/JobsSkeleton";
import ListState from "@/features/jobs/components/list/ListState";
import useJobSelection from "@/features/jobs/hooks/useJobSelection";
import { PAGE_SIZES } from "@/features/jobs/utils/jobOptions";
import TrashBulkBar from "../components/TrashBulkBar";
import TrashEmpty from "../components/TrashEmpty";
import TrashHeader from "../components/TrashHeader";
import TrashTable from "../components/TrashTable";
import useTrashActions from "../hooks/useTrashActions";
import useTrashList from "../hooks/useTrashList";
import { plural } from "../utils/format";

const DEFAULT_SIZE = 10;

export default function TrashPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // The URL is the source of truth: /trash?view=archive|trash&page=2&size=50
  const view = searchParams.get("view") === "trash" ? "trash" : "archive";
  const page = Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1);
  const sizeParam = Number.parseInt(searchParams.get("size"), 10);
  const size = PAGE_SIZES.includes(sizeParam) ? sizeParam : DEFAULT_SIZE;

  const [confirm, setConfirm] = useState(null); // { ids } waiting for delete forever

  const { status, jobs, total, counts, retry } = useTrashList({ view, page, size });
  const intro = useIntro(status === "success");
  const selection = useJobSelection(jobs);
  const actions = useTrashActions({ clearSelection: selection.clear });

  const showList = status === "success" && total > 0;

  // Rewrites the query string. Anything not passed keeps its current value, except page (resets to 1).
  // Page 1 and the default size are left out to keep the URL clean.
  const updateParams = useCallback(
    ({ view: nextView = view, page: nextPage = 1, size: nextSize = size }, options) => {
      const next = { view: nextView };
      if (nextPage > 1) next.page = String(nextPage);
      if (nextSize !== DEFAULT_SIZE) next.size = String(nextSize);
      setSearchParams(next, options);
    },
    [setSearchParams, view, size],
  );

  const changeView = (next) => {
    updateParams({ view: next });
    selection.clear();
  };

  const changePage = (next) => updateParams({ page: next });
  const changeSize = (next) => updateParams({ size: next });

  const handleConfirm = () => {
    const { ids } = confirm;
    setConfirm(null);
    actions.purge(ids);
  };

  // If the last row of the last page was removed, or the URL has a page past the end,
  // step back to the new last page.
  useEffect(() => {
    if (status === "success" && jobs.length === 0 && total > 0 && page > 1) {
      updateParams({ page: Math.ceil(total / size) }, { replace: true });
    }
  }, [status, jobs.length, total, page, size, updateParams]);

  return (
    <>
      <TrashHeader view={view} counts={counts} onViewChange={changeView} />

      {status === "loading" && <JobsSkeleton />}
      {status === "error" && <ListState variant="error" onRetry={retry} />}
      {status === "success" && total === 0 && <TrashEmpty view={view} />}

      {showList && (
        <>
          <TrashTable
            view={view}
            jobs={jobs}
            intro={intro}
            selection={selection}
            actions={actions}
            onPurge={(ids) => setConfirm({ ids })}
          />

          {selection.selectedIds.length > 0 && (
            <TrashBulkBar
              view={view}
              count={selection.selectedIds.length}
              selectedIds={selection.selectedIds}
              actions={actions}
              onPurge={(ids) => setConfirm({ ids })}
              onClear={selection.clear}
            />
          )}

          <JobsFooter total={total} page={page} size={size} onPageChange={changePage} onSizeChange={changeSize} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete forever?"
        confirmLabel="Delete forever"
        destructive
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      >
        {confirm ? plural(confirm.ids.length) : ""} will be permanently deleted. This cannot be undone.
      </ConfirmDialog>
    </>
  );
}