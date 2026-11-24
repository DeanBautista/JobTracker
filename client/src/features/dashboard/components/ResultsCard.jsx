import Card from "./shared/Card";
import CardStatus from "./shared/CardStatus";

const NUMBER_CELL = "border-t border-rule py-2.5 text-right font-mono text-[13px]";

const rate = ({ total, replies }) => (total ? Math.round((replies / total) * 100) : 0);

export default function ResultsCard({
  title,
  subtitle,
  headings,
  rows,
  status = "success",
  onRetry,
  className,
}) {
  return (
    <Card title={title} subtitle={subtitle} className={className}>
      <CardStatus status={status} onRetry={onRetry} label={title.toLowerCase()}>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {headings.map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="pb-2 text-right font-mono text-[11px] leading-none font-medium tracking-[0.06em] text-muted uppercase first:text-left"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name}>
                    <td className="border-t border-rule py-2.5 text-left text-sm">{row.name}</td>
                    <td className={NUMBER_CELL}>{row.total}</td>
                    <td className={NUMBER_CELL}>{row.replies}</td>
                    <td className={`${NUMBER_CELL} text-muted`}>{rate(row)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardStatus>
    </Card>
  );
}