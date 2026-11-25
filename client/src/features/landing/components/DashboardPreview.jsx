import Section from "@/features/landing/components/shared/Section";
import SectionIntro from "@/features/landing/components/shared/SectionIntro";
import { DASHBOARD } from "@/features/landing/data/landingContent";
import Reveal from "@/components/Reveal";

const { tiles, funnel, goal, results } = DASHBOARD;

function Card({ title, className = "", children }) {
  return (
    <Reveal className={`rounded-md border border-rule bg-surface p-4 ${className}`}>
      <h3 className="mb-3.5 font-mono text-xs leading-none font-medium tracking-[0.06em] text-muted uppercase">
        {title}
      </h3>
      {children}
    </Reveal>
  );
}

const thClass =
  "pb-2 text-right font-mono text-[11px] leading-none font-medium tracking-[0.06em] text-muted uppercase first:text-left";
const tdClass = "border-t border-rule py-[9px] text-right font-mono text-[12.5px] first:text-left first:font-sans first:text-[13.5px]";

export default function DashboardPreview() {
  return (
    <Section id="dashboard" labelledBy="dash-title">
      <SectionIntro
        id="dash-title"
        label="Dashboard"
        title="See whether your search is working"
        description="Your numbers appear after you add your first job. The figures below are sample data."
      />

      <div
        role="img"
        aria-label="Sample dashboard: 24 applied, 9 replied, 3 interviewing, 1 offer, with a funnel, weekly goal and resume results"
        className="overflow-hidden rounded-[10px] border border-ink bg-surface"
      >
        <div className="flex items-center justify-between border-b border-rule px-[18px] py-3">
          <span className="label">Last 90 days</span>
          <span className="label">Sample data</span>
        </div>

        <div aria-hidden="true" className="grid gap-4 bg-tint p-[18px]">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {tiles.map(({ value, label }, i) => (
              <Reveal key={label} index={i} className="rounded-md border border-rule bg-surface px-4 py-3.5">
                <span className="block font-serif text-[34px] leading-none tracking-[-0.02em]">{value}</span>
                <span className="mt-1.5 block text-[13px] text-muted">{label}</span>
              </Reveal>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <Card title="Funnel">
              <ul>
                {funnel.map(({ label, value, percent }) => (
                  <li
                    key={label}
                    className="mb-2.5 grid grid-cols-[84px_1fr_28px] items-center gap-2.5 text-[13.5px] last:mb-0"
                  >
                    <span>{label}</span>
                    <span className="h-[18px] overflow-hidden rounded-[3px] bg-tint">
                      <span style={{ width: `${percent}%` }} className="bar-x block h-full rounded-[3px] bg-accent" />
                    </span>
                    <b className="text-right font-mono text-[13px] font-medium">{value}</b>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Weekly goal">
              <b className="font-serif text-[30px] leading-none font-normal">
                {goal.done} of {goal.target}
              </b>
              <div className="mt-3 mb-2 h-2 overflow-hidden rounded-[4px] bg-tint">
                <span style={{ width: `${(goal.done / goal.target) * 100}%` }} className="bar-x block h-full bg-accent" />
              </div>
              <p className="text-[13.5px] text-muted">One more application to reach this week’s goal.</p>
            </Card>
          </div>

          <Card title="Which resume gets replies">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th className={thClass}>Resume</th>
                  <th className={thClass}>Sent</th>
                  <th className={thClass}>Replies</th>
                </tr>
              </thead>
              <tbody>
                {results.map(({ resume, sent, replies }) => (
                  <tr key={resume}>
                    <td className={tdClass}>{resume}</td>
                    <td className={tdClass}>{sent}</td>
                    <td className={tdClass}>{replies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </Section>
  );
}