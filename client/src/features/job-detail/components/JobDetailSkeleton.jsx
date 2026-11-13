import SkeletonCard from "../../../components/ui/SkeletonCard";

export default function JobDetailSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading job details">
      <div className="mb-6 h-7 w-[38%] rounded-lg bg-tint motion-safe:animate-pulse" />
      <div className="mb-5 h-11 border-b border-rule" />
      <div className="grid gap-5 split:grid-cols-[minmax(0,1.65fr)_minmax(15rem,0.8fr)]">
        <SkeletonCard lines={5} className="min-h-[210px] sm:min-h-[270px]" />
        <SkeletonCard lines={3} className="min-h-[210px] sm:min-h-[270px]" />
      </div>
    </div>
  );
}
