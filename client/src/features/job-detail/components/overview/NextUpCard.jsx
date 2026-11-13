import Panel from "../../../../components/ui/Panel";
import { formatTime, formatWeekdayDate, getDueInfo } from "../../utils/formatters";

const byDate = (key) => (a, b) => new Date(a[key]) - new Date(b[key]);

export default function NextUpCard({ job, onTabChange }) {
  const now = new Date();
  const interview = job.interviews
    .filter((r) => r.status === "scheduled" && new Date(r.startsAt) >= now)
    .sort(byDate("startsAt"))[0];
  const reminder = job.reminders.filter((r) => !r.doneAt).sort(byDate("dueAt"))[0];

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
              <dt className="label">{interview.type}</dt>
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
