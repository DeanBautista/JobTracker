import { useEffect, useState } from "react";
import Panel from "../../../../components/ui/Panel";
import { api } from "../../../../lib/api";
import { INTERVIEW_ROUND_LABELS } from "../../utils/detailOptions";
import { formatTime, formatWeekdayDate, getDueInfo } from "../../utils/formatters";

export default function NextUpCard({ job, onTabChange }) {
  const now = new Date();
  const [{ interview, reminder }, setNext] = useState({ interview: null, reminder: null });

  // The Overview tab remounts on every tab switch, so this is fresh after reminder or interview changes.
  useEffect(() => {
    let cancelled = false;
    api
      .get(`/jobs/${job.id}/next-up`)
      .then(({ data }) => !cancelled && setNext(data.nextUp))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [job.id]);

  return (
    <Panel className="p-[17px]">
      <h2 className="font-serif text-[1.15rem] leading-tight font-medium">Next up</h2>
      <p className="mt-[7px] text-meta text-muted">
        {interview || reminder ? "Your next step for this job." : "Nothing scheduled yet."}
      </p>

      {(interview || reminder) && (
        <dl className="mt-[15px] grid gap-[13px]">
          {interview && (
            <div className="grid gap-[3px]">
              <dt className="label">{INTERVIEW_ROUND_LABELS[interview.type] ?? interview.type}</dt>
              <dd className="text-meta font-semibold">
                {formatWeekdayDate(interview.startsAt)} · {formatTime(interview.startsAt)}
              </dd>
            </div>
          )}
          {reminder && (
            <div className="grid gap-[3px]">
              <dt className="label">Reminder</dt>
              <dd className="text-meta">
                <button type="button" className="link cursor-pointer text-left" onClick={() => onTabChange("reminders")}>
                  {getDueInfo(reminder, now).label}
                </button>
              </dd>
            </div>
          )}
        </dl>
      )}

      {interview && (
        <div className="mt-[15px]">
          <button type="button" className="btn btn-sm" onClick={() => onTabChange("interviews")}>
            View interview
          </button>
        </div>
      )}
    </Panel>
  );
}