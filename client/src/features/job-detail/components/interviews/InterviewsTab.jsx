import { useState } from "react";
import SectionHeader from "../../../../components/ui/SectionHeader";
import StateCard from "../../../../components/ui/StateCard";
import ConfirmDialog from "../../../../components/ConfirmDialog"; 
import useJobInterviews from "../../hooks/useJobInterviews";
import InterviewDialog from "./InterviewDialog";
import ResultDialog from "./ResultDialog";
import RoundCard from "./RoundCard";

const count = (n) => (n === 1 ? "1 round" : `${n} rounds`);

export default function InterviewsTab({ job, readOnly, onCountChange }) {
  const { status, rounds, retry, add, edit, saveResult, cancel, remove } = useJobInterviews(job.id, onCountChange);
  const [dialog, setDialog] = useState(null); // { mode: "add" } | { mode: "edit" | "result", round }
  const [deleting, setDeleting] = useState(null); // round pending deletion

  const now = new Date();
  const isUpcoming = (r) => r.status === "scheduled" && new Date(r.startsAt) >= now;
  const upcoming = rounds.filter(isUpcoming).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  const past = rounds.filter((r) => !isUpcoming(r)).sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));

  const renderRound = (round, isPast) => (
    <RoundCard
      key={round.id}
      round={round}
      past={isPast}
      readOnly={readOnly}
      onEdit={() => setDialog({ mode: "edit", round })}
      onResult={() => setDialog({ mode: "result", round })}
      onCancel={() => cancel(round.id)}
      onDelete={() => setDeleting(round)}
    />
  );

  const close = () => setDialog(null);
  const openAdd = () => setDialog({ mode: "add" });

  return (
    <div className="grid gap-[18px]">
      <SectionHeader
        id="interviews-heading"
        title="Interviews"
        subtitle="Keep each round, prep notes, and feedback together."
        aside={
          !readOnly &&
          status === "success" && (
            <button type="button" className="btn btn-primary" onClick={openAdd}>
              ＋ Add interview round
            </button>
          )
        }
      />

      {status === "loading" && <p className="text-sm text-muted">Loading interviews…</p>}

      {status === "error" && (
        <StateCard
          role="alert"
          icon="!"
          title="Could not load interviews"
          message="Your interview rounds could not be loaded. Try again."
          action={
            <button type="button" className="btn" onClick={retry}>
              Try again
            </button>
          }
        />
      )}

      {status === "success" &&
        (rounds.length === 0 ? (
          <StateCard
            icon="◷"
            title="No interview rounds yet"
            message="Add a round to track the date, format, preparation, and feedback."
            action={
              !readOnly && (
                <button type="button" className="btn btn-primary" onClick={openAdd}>
                  Add interview round
                </button>
              )
            }
          />
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <SectionHeader
                  level="sub"
                  title="Upcoming"
                  aside={<span className="text-[12.5px] text-muted">{count(upcoming.length)}</span>}
                />
                {upcoming.map((r) => renderRound(r, false))}
              </>
            )}
            {past.length > 0 && (
              <>
                <SectionHeader
                  level="sub"
                  title="Past rounds"
                  aside={<span className="text-[12.5px] text-muted">{count(past.length)}</span>}
                />
                {past.map((r) => renderRound(r, true))}
              </>
            )}
          </>
        ))}

      <InterviewDialog
        open={dialog?.mode === "add" || dialog?.mode === "edit"}
        job={job}
        round={dialog?.round}
        onClose={close}
        onSubmit={async (data) => {
          const ok = dialog.round ? await edit(dialog.round.id, data) : await add(data);
          if (ok) close();
        }}
      />
      <ResultDialog
        open={dialog?.mode === "result"}
        round={dialog?.round}
        onClose={close}
        onSubmit={async (data) => {
          if (await saveResult(dialog.round.id, data)) close();
        }}
      />
      <ConfirmDialog
        open={!!deleting}
        title="Delete this interview round?"
        confirmLabel="Delete round"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          remove(deleting.id);
          setDeleting(null);
        }}
      >
        Its feedback and reminders will be deleted too. This can't be undone.
      </ConfirmDialog>
    </div>
  );
}