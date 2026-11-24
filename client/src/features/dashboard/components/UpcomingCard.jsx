import { Link } from "react-router-dom";
import Card from "./shared/Card";

export default function UpcomingCard({ interviews, className }) {
  return (
    <Card
      title="Upcoming interviews"
      aside={<span className="label">Next 7 days</span>}
      subtitle="Soonest first."
      className={className}
    >
      <ul>
        {interviews.map((item) => (
          <li
            key={item.jobId}
            className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-4 border-t border-rule py-3.5 first:border-t-0 first:pt-1 sm:grid-cols-[56px_minmax(0,1fr)_auto]"
          >
            <div
              className={`rounded-md border py-1.5 text-center font-mono text-[10.5px] leading-none tracking-[0.05em] uppercase ${
                item.isToday
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-rule bg-paper text-muted"
              }`}
            >
              {item.weekday}
              <b className="mt-1 block font-serif text-[1.35rem] leading-none font-normal tracking-normal text-ink">
                {item.day}
              </b>
            </div>

            <div>
              <strong className="font-semibold">{item.company}</strong> · {item.round}
              <small className="block text-[13px] text-muted">{item.meta}</small>
            </div>

            <Link
              to={`/jobs/${item.jobId}`}
              className="btn btn-sm col-start-2 justify-self-start sm:col-auto"
            >
              Open job
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
