import { Link } from "react-router-dom";

const COPY = {
  archive: {
    title: "Nothing archived.",
    text: "Archive jobs you are done with to keep your board and list clear.",
  },
  trash: {
    title: "Trash is empty.",
    text: "Deleted jobs stay here for 30 days before they are removed.",
  },
};

export default function TrashEmpty({ view }) {
  const { title, text } = COPY[view];

  return (
    <section
      aria-labelledby="trash-empty-title"
      className="animate-rise rounded-lg border border-dashed border-muted bg-surface px-6 py-14 text-center"
    >
      <h2 id="trash-empty-title" className="font-serif text-[1.7rem] leading-[1.15] font-normal tracking-[-0.015em]">
        {title}
      </h2>
      <p className="mx-auto mt-3 mb-6 max-w-[46ch] text-muted">{text}</p>
      <Link to="/jobs" className="btn">Go to list</Link>
    </section>
  );
}
