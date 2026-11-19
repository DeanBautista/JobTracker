import { useMemo, useState } from "react";
import { useAddJob } from "@/features/jobs";
import CloseReasonDialog from "@/features/board/components/CloseReasonDialog";
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
import { CLOSED_STAGES, REASON_STAGES, isClosedStage } from "../utils/boardStages";

export default function BoardPage() {
  const { openAddJob } = useAddJob();
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
  const addJob = (stage) => openAddJob({ stage: stage ?? "wishlist" });

  // Moving into Rejected / Withdrawn / Ghosted asks for a reason first.
  // The card stays put until the dialog is confirmed; Cancel leaves it where it was.
  const [pendingClose, setPendingClose] = useState(null); // { id, job, stage, options }

  const handleMove = (id, stage, options) => {
    const job = jobs.find((j) => j.id === id);
    if (job && job.stage !== stage && REASON_STAGES.includes(stage)) {
      setPendingClose({ id, job, stage, options });
      return;
    }
    moveJob(id, stage, options);
  };

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
          onMove={handleMove}
          onAddJob={addJob}
          onArchive={archive}
          onDelete={remove}
        />
      )}

      <BoardToast move={lastMove} error={moveError} onUndo={undoMove} onDismiss={clearNotice} />

      {pendingClose && (
        <CloseReasonDialog
          job={pendingClose.job}
          stage={pendingClose.stage}
          onCancel={() => setPendingClose(null)}
          onConfirm={(closing) => {
            moveJob(pendingClose.id, pendingClose.stage, { ...pendingClose.options, closing });
            setPendingClose(null);
          }}
        />
      )}
    </>
  );
}
