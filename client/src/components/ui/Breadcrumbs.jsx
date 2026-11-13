import { Link } from "react-router-dom";

// items: [{ label, to? }]. The last item (no `to`) is the current page.
export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted">
        {items.map((item, i) => (
          <li key={`${i}-${item.label}`} className="flex min-w-0 items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className="text-rule">
                /
              </span>
            )}
            {item.to ? (
              <Link to={item.to} className="link">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium break-words text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
