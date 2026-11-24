const LABELS = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
};

// Turns [{ stage, count }] into bar rows and finds the step that lost the most jobs.
export function buildFunnel(steps) {
  const top = steps[0]?.count ?? 0;

  const rows = steps.map((step, i) => {
    const prev = steps[i - 1]?.count;
    return {
      ...step,
      label: LABELS[step.stage],
      width: top ? Math.round((step.count / top) * 100) : 0,
      pct: prev ? `${Math.round((step.count / prev) * 100)}%` : "–",
    };
  });

  let biggestDrop = null;
  for (let i = 1; i < rows.length; i++) {
    const lost = rows[i - 1].count - rows[i].count;
    if (lost > 0 && (!biggestDrop || lost > biggestDrop.lost)) {
      biggestDrop = { from: rows[i - 1], to: rows[i], lost };
    }
  }

  return { rows, biggestDrop };
}