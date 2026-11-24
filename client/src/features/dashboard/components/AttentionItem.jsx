import { Link } from "react-router-dom";

export default function AttentionItem({ item, onAction }) {
  return (
    <li
      className={`flex flex-col gap-1.5 rounded-md border bg-paper p-3.5 ${
        item.late ? "border-danger" : "border-rule"
      }`}
    >
      <span
        className={`self-start rounded-sm px-2 py-0.5 font-mono text-[10.5px] leading-normal font-medium tracking-[0.05em] uppercase ${
          item.late ? "bg-danger-soft text-danger" : "bg-tint text-muted"
        }`}
      >
        {item.tag}
      </span>
      <strong className="leading-[1.3] font-semibold">{item.title}</strong>
      <small className="text-[13px] leading-[1.4] text-muted">{item.detail}</small>

      <div className="mt-auto flex gap-2 pt-2">
        {item.actions.map((action) =>
          action.to ? (
            <Link key={action.label} to={action.to} className="btn btn-sm">
              {action.label}
            </Link>
          ) : (
            <button
              key={action.label}
              type="button"
              className="btn btn-sm"
              onClick={() => onAction?.(item.id, action.key)}
            >
              {action.label}
            </button>
          ),
        )}
      </div>
    </li>
  );
}
