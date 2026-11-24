const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

// Compares this period with the previous one of the same length.
function describe({ cur, prev, unit = "", allNote }, days) {
  if (!days) return { note: allNote };
  if (prev === null) return { note: "No previous data" };

  const diff = cur - prev;
  if (diff === 0) return { note: "Same as previous" };

  return {
    delta: `${diff > 0 ? "+" : "-"}${Math.abs(diff)}${unit}`,
    tone: diff > 0 ? "up" : "down",
    note: `vs previous ${days} days`,
  };
}

export function buildTiles({ current, previous }, range) {
  const days = Number(range) || null; // "all" becomes null
  const rate = percent(current.replies, current.applied);

  const defs = [
    {
      id: "applied",
      label: "Applied",
      hint: "Jobs that first reached Applied (or beyond) in the selected range.",
      value: String(current.applied),
      cur: current.applied,
      prev: previous ? previous.applied : null,
      allNote: "Since you started",
    },
    {
      id: "response",
      label: "Response rate",
      hint: "Share of those jobs that got a reply: reached Screening or beyond, or were rejected.",
      value: `${rate}%`,
      cur: rate,
      prev: previous?.applied ? percent(previous.replies, previous.applied) : null,
      unit: " pts",
      allNote: `${current.replies} of ${current.applied} jobs replied`,
    },
    {
      id: "interviewing",
      label: "Interviewing",
      hint: "Jobs that first reached Interview in the selected range.",
      value: String(current.interviews),
      cur: current.interviews,
      prev: previous ? previous.interviews : null,
      allNote: "Reached an interview",
    },
    {
      id: "offers",
      label: "Offers",
      hint: "Jobs that first reached Offer (or Accepted) in the selected range.",
      value: String(current.offers),
      cur: current.offers,
      prev: previous ? previous.offers : null,
      allNote: "Reached an offer",
    },
  ];

  return defs.map((def) => ({
    id: def.id,
    label: def.label,
    hint: def.hint,
    value: def.value,
    ...describe(def, days),
  }));
}