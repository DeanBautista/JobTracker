import { Link } from "react-router-dom";
import AttentionItem from "./AttentionItem";

export default function AttentionPanel({ items, onAction }) {
  return (
    <section className="card mb-5" aria-labelledby="attn-title">
      <div className="mb-4 flex items-baseline justify-between">
        <h2
          id="attn-title"
          className="font-serif text-[1.2rem] leading-[1.2] font-medium tracking-[-0.01em]"
        >
          Needs attention
        </h2>
        <Link to="/reminders" className="link text-[13.5px] text-muted">
          View all reminders
        </Link>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <AttentionItem key={item.id} item={item} onAction={onAction} />
        ))}
      </ul>
    </section>
  );
}
