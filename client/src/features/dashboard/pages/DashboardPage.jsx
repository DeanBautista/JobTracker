import { useState } from "react";
import { useAuth } from "@/features/auth/context/useAuth";
import useAddJob from "@/features/jobs/hooks/useAddJob";
import CardStatus from "../components/shared/CardStatus";
import DashboardContent from "../components/DashboardContent";
import DashboardHeader from "../components/DashboardHeader";
import EmptyDashboard from "../components/EmptyDashboard";
import useHasJobs from "../hooks/useHasJobs";

export default function DashboardPage() {
  const { user } = useAuth();
  const { openAddJob, jobsVersion } = useAddJob();
  const [range, setRange] = useState("all");
  const hasJobs = useHasJobs(jobsVersion);

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const ready = hasJobs.status === "success";

  return (
    <>
      <DashboardHeader
        firstName={firstName}
        range={range}
        onRangeChange={setRange}
        onAddJob={openAddJob}
        showControls={ready && hasJobs.value}
      />

      {!ready && (
        <div className="card">
          <CardStatus status={hasJobs.status} onRetry={hasJobs.retry} label="your dashboard" />
        </div>
      )}

      {ready && !hasJobs.value && <EmptyDashboard onAddJob={openAddJob} />}

      {/* key remounts the cards when a job is added, so every number refetches */}
      {ready && hasJobs.value && <DashboardContent key={jobsVersion} range={range} />}
    </>
  );
}