import useBreakdown from "../hooks/useBreakdown";
import useFunnel from "../hooks/useFunnel";
import useStats from "../hooks/useStats";
import useWeekly from "../hooks/useWeekly";
import { mockDashboard as data } from "../data/mockDashboard";
import AttentionPanel from "./AttentionPanel";
import FunnelCard from "./FunnelCard";
import RejectionsCard from "./RejectionsCard";
import ResultsCard from "./ResultsCard";
import StatTiles from "./StatTiles";
import UpcomingCard from "./UpcomingCard";
import WeeklyChart from "./WeeklyChart";

const WIDE = "col-span-12 md:col-span-6 xl:col-span-7";
const NARROW = "col-span-12 md:col-span-6 xl:col-span-5";
const THIRD = "col-span-12 md:col-span-6 xl:col-span-4";

export default function DashboardContent({ range }) {
  const funnel = useFunnel(range);
  const weekly = useWeekly();
  const breakdown = useBreakdown(range);
  const stats = useStats(range);

  return (
    <>
      <AttentionPanel items={data.attention} />
      <StatTiles stats={stats.data} status={stats.status} range={range} onRetry={stats.retry} />

      <div className="grid grid-cols-12 gap-4">
        <FunnelCard
          steps={funnel.steps}
          status={funnel.status}
          range={range}
          onRetry={funnel.retry}
          className={WIDE}
        />
        <WeeklyChart
          counts={weekly.counts}
          goal={weekly.goal}
          status={weekly.status}
          onRetry={weekly.retry}
          className={NARROW}
        />

        <ResultsCard
          title="By source"
          subtitle="Which sites bring replies."
          headings={["Source", "Applied", "Replies", "Rate"]}
          rows={breakdown.sources}
          status={breakdown.status}
          onRetry={breakdown.retry}
          className={THIRD}
        />
        <RejectionsCard
          reasons={breakdown.rejections.reasons}
          topStage={breakdown.rejections.topStage}
          status={breakdown.status}
          onRetry={breakdown.retry}
          className={THIRD}
        />
        <ResultsCard
          title="Resume results"
          subtitle="Which resume gets replies."
          headings={["Resume", "Sent", "Replies", "Rate"]}
          rows={data.resumes}
          className={THIRD}
        />

        <UpcomingCard interviews={data.upcoming} className="col-span-12" />
      </div>
    </>
  );
}