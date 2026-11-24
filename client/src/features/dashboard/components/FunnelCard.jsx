import { Link } from "react-router-dom";
import { buildFunnel } from "../utils/funnel";
import BarTrack from "./shared/BarTrack";
import Card from "./shared/Card";
import InfoTip from "./shared/InfoTip";

export default function FunnelCard({ steps, status, range, onRetry, className }) {
  const { rows, biggestDrop } = buildFunnel(steps);

  return (
    <Card
      title="Funnel"
      aside={
        <InfoTip label="Funnel">
          Furthest stage each job reached. A job that skipped a stage counts as having passed it.
        </InfoTip>
      }
      subtitle="Where jobs drop off. Select a step to see those jobs."
      className={className}
    >
      {status === "loading" && <p className="text-sm text-muted">Loading funnel…</p>}

      {status === "error" && (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-danger">Couldn't load the funnel.</span>
          <button type="button" className="btn btn-sm" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      {status === "success" && (
        <>
          <ul className="grid gap-1">
            {rows.map((row) => (
              <li key={row.stage}>
                <Link
                  className="group grid grid-cols-[72px_minmax(0,1fr)_26px_40px] items-center gap-2 py-1.5 text-sm no-underline sm:grid-cols-[84px_minmax(0,1fr)_28px_44px] sm:gap-3"
                >
                  <span className="group-hover:underline">{row.label}</span>
                  <BarTrack percent={row.width} fillClassName="group-hover:bg-ink" />
                  <span className="text-right font-mono text-[13px] leading-none font-medium">
                    {row.count}
                  </span>
                  <span className="text-right font-mono text-xs leading-none text-muted">
                    {row.pct}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {biggestDrop && (
            <p className="mt-4 border-t border-rule pt-3 text-[13px] text-muted">
              Biggest drop: {biggestDrop.from.label} to {biggestDrop.to.label}, {biggestDrop.lost}{" "}
              of {biggestDrop.from.count} jobs went no further.
            </p>
          )}
        </>
      )}
    </Card>
  );
}