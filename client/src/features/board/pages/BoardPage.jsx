import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Board from "../components/board/Board";
import BoardActiveFilters from "../components/board/BoardActiveFilters";
import BoardFilters from "../components/board/BoardFilters";
import BoardHeader from "../components/board/BoardHeader";
import BoardSkeleton from "../components/board/BoardSkeleton";
import BoardState from "../components/board/BoardState";
import BoardToast from "../components/board/BoardToast";
import StageJumpNav from "../components/board/StageJumpNav";
import useBoardFilters from "../hooks/useBoardFilters";
import useBoardJobs from "../hooks/useBoardJobs";
import { filterJobs, groupByStage } from "../utils/boardFilters";
import { CLOSED_STAGES, isClosedStage } from "../utils/boardStages";

export default function BoardPage() {
  const navigate = useNavigate();
  const { filters, activeFilters, preview, applyFilters, clearFilters, removeFilter } = useBoardFilters();
  const { status, jobs, retry, moveJob, undoMove, lastMove, moveError, clearNotice, archive, remove } = useBoardJobs({ preview });

  // Everything below is derived from state, so counts stay right after a drop.
  const visibleJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);
  const groups = useMemo(() => groupByStage(visibleJobs), [visibleJobs]);

  const hasFilters = activeFilters.length > 0;
  const openTotal = jobs.filter((j) => !isClosedStage(j.stage)).length;
  const openMatches = visibleJobs.filter((j) => !isClosedStage(j.stage)).length;
  const closedTotal = CLOSED_STAGES.reduce((n, s) => n + groups[s.value].length, 0);

  const isEmpty = status === "success" && jobs.length === 0;
  const noMatches = status === "success" && jobs.length > 0 && visibleJobs.length === 0;
  const showFilters = status === "success" && !isEmpty;
  const showBoard = status === "success" && visibleJobs.length > 0;

  // If useAddJob() exposes an "open dialog with a preset stage", call that here instead.
  const addJob = (stage) => navigate(`/jobs/new?stage=${stage ?? "wishlist"}`);

  return (
    <>
      <BoardHeader openTotal={openTotal} openMatches={openMatches} hasFilters={hasFilters} />

      {showBoard && <StageJumpNav groups={groups} closedTotal={closedTotal} />}

      {showFilters && (
        <>
          <BoardFilters key={JSON.stringify(filters)} filters={filters} onApply={applyFilters} onClear={clearFilters} />
          <BoardActiveFilters activeFilters={activeFilters} onRemove={removeFilter} onClear={clearFilters} />
        </>
      )}

      {status === "loading" && <BoardSkeleton />}
      {status === "error" && <BoardState variant="error" onRetry={retry} />}
      {isEmpty && <BoardState variant="empty" onAdd={() => addJob("wishlist")} />}
      {noMatches && <BoardState variant="none" onClear={clearFilters} />}

      {showBoard && (
        <Board
          groups={groups}
          jobs={visibleJobs}
          onMove={moveJob}
          onAddJob={addJob}
          onArchive={archive}
          onDelete={remove}
        />
      )}

      <BoardToast move={lastMove} error={moveError} onUndo={undoMove} onDismiss={clearNotice} />
    </>
  );
}
