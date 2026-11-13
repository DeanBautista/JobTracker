import { useState } from "react";
import SectionHeader from "../../../../components/ui/SectionHeader";
import StateCard from "../../../../components/ui/StateCard";
import InterviewDialog from "./InterviewDialog";
import ResultDialog from "./ResultDialog";
import RoundCard from "./RoundCard";

const count = (n) => (n === 1 ? "1 round" : `${n} rounds`);

export default function InterviewsTab({ job, readOnly, actions }) {
  const [dialog, setDialog] = useState(null); // { mode: "add" } | { mode: "edit" | "result", round }

  const now = new Date();
  const isUpcoming = (r) => r.status === "scheduled" && new Date(r.startsAt) >= now;
  const upcoming = job.interviews.filter(isUpcoming).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  const past = job.interviews.filter((r) => !isUpcoming(r)).sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));

  const renderRound = (round, isPast) => (
    <RoundCard
      key={round.id}
      round={round}
      past={isPast}
      readOnly={readOnly}
      onEdit={() => setDialog({ mode: "edit", round })}
      onResult={() => setDialog({ mode: "result", round })}
      onCancel={() => actions.cancel(job.id, round.id)}
    />
  );

  const close = () => setDialog(null);

  return (
    <div className="grid gap-[18px]">
      <SectionHeader
        id="interviews-heading"
        title="Interviews"
        subtitle="Keep each round, prep notes, and feedback together."
        aside={
          !readOnly && (
            <button type="button" className="btn btn-primary" onClick={() => setDialog({ mode: "add" })}>
              ＋ Add interview round
            </button>
          )
        }
      />

      {job.interviews.length === 0 ? (
        <StateCard
          icon="◷"
          title="No interview rounds yet"
          message="Add a round to track the date, format, preparation, and feedback."
          action={
            !readOnly && (
              <button type="button" className="btn btn-primary" onClick={() => setDialog({ mode: "add" })}>
                Add interview round
              </button>
            )
          }
        />
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <SectionHeader level="sub" title="Upcoming" aside={<span className="text-[12.5px] text-muted">{count(upcoming.length)}</span>} />
              {upcoming.map((r) => renderRound(r, false))}
            </>
          )}
          {past.length > 0 && (
            <>
              <SectionHeader level="sub" title="Past rounds" aside={<span className="text-[12.5px] text-muted">{count(past.length)}</span>} />
              {past.map((r) => renderRound(r, true))}
            </>
          )}
        </>
      )}

      <InterviewDialog
        open={dialog?.mode === "add" || dialog?.mode === "edit"}
        job={job}
        round={dialog?.round}
        onClose={close}
        onSubmit={(data) => {
          if (dialog.round) actions.edit(job.id, dialog.round.id, data);
          else actions.add(job.id, data);
          close();
        }}
      />
      <ResultDialog
        open={dialog?.mode === "result"}
        round={dialog?.round}
        onClose={close}
        onSubmit={(data) => {
          actions.saveResult(job.id, dialog.round.id, data);
          close();
        }}
      />
    </div>
  );
}
