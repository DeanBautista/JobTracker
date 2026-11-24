import BarTrack from "./shared/BarTrack";
import Card from "./shared/Card";
import CardStatus from "./shared/CardStatus";

const REASON_LABELS = {
  no_response: "No response",
  not_enough_experience: "Experience",
  position_closed: "Position closed",
  salary_mismatch: "Salary",
  took_another_offer: "Took another offer",
  other: "Other",
};

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export default function RejectionsCard({ reasons, topStage, status, onRetry, className }) {
  const max = Math.max(...reasons.map((reason) => reason.count), 1);

  return (
    <Card title="Rejections" subtitle="Why jobs were closed." className={className}>
      <CardStatus status={status} onRetry={onRetry} label="rejections">
        {reasons.length === 0 ? (
          <p className="text-sm text-muted">No closed jobs yet.</p>
        ) : (
          <>
            <ul>
              {reasons.map((reason) => (
                <li
                  key={reason.key}
                  className="grid grid-cols-[96px_minmax(0,1fr)_22px] items-center gap-2.5 py-1.5 text-sm sm:grid-cols-[112px_minmax(0,1fr)_24px]"
                >
                  <span>{REASON_LABELS[reason.key] ?? reason.key}</span>
                  <BarTrack percent={(reason.count / max) * 100} className="h-3" />
                  <span className="text-right font-mono text-[13px] leading-none font-medium">
                    {reason.count}
                  </span>
                </li>
              ))}
            </ul>

            {topStage && (
              <p className="mt-3.5 border-t border-rule pt-3 text-[13px] text-muted">
                Most rejections happen at:{" "}
                <strong className="font-semibold text-ink">{capitalize(topStage)}</strong>
              </p>
            )}
          </>
        )}
      </CardStatus>
    </Card>
  );
}