import { buildTiles } from "../utils/stats";
import CardStatus from "./shared/CardStatus";
import InfoTip from "./shared/InfoTip";

const DELTA_TONE = { up: "text-accent", down: "text-danger" };

export default function StatTiles({ stats, status, range, onRetry }) {
  if (status !== "success") {
    return (
      <div className="card mb-4">
        <CardStatus status={status} onRetry={onRetry} label="stats" />
      </div>
    );
  }

  return (
    <div className="mb-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
      {buildTiles(stats, range).map((tile) => (
        <section key={tile.id} className="card px-5 py-4.5 max-sm:p-3.5" aria-label={tile.label}>
          <div className="flex items-center justify-between text-[13.5px] text-muted">
            {tile.label}
            <InfoTip label={tile.label}>{tile.hint}</InfoTip>
          </div>
          <p className="mt-2 mb-1.5 font-serif text-[2.1rem] leading-none tracking-[-0.025em] sm:text-[2.6rem]">
            {tile.value}
          </p>
          <p className="font-mono text-xs leading-[1.4] text-muted">
            {tile.delta && <span className={`mr-1 ${DELTA_TONE[tile.tone]}`}>{tile.delta}</span>}
            {tile.note}
          </p>
        </section>
      ))}
    </div>
  );
}