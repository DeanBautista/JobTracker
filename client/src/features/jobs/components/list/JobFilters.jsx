import {
  CLOSED_STAGES, DATE_RANGES, MODES, OPEN_STAGES, PRIORITIES, SOURCES,
} from "../../utils/jobOptions";

const flexCell = "flex-[1_1_140px] tbl:flex-none";

function FilterSelect({ name, label, placeholder, value, options }) {
  return (
    <select name={name} aria-label={label} defaultValue={value} className={`field ${flexCell}`}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default function JobFilters({ filters, onApply }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(Object.fromEntries(new FormData(e.currentTarget)));
  };

  return (
    <form
      key={Object.values(filters).join("|")} // remount so fields reset when a chip is removed
      role="search"
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2.5"
    >
      <div className="relative min-w-0 flex-[1_1_180px]">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-[15px] -translate-y-1/2 text-muted"
        >
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="Search jobs"
          aria-label="Search jobs"
          className="field w-full pl-9 placeholder:text-muted"
        />
      </div>

      <select name="stage" aria-label="Stage" defaultValue={filters.stage} className={`field ${flexCell}`}>
        <option value="">All stages</option>
        <optgroup label="Open">
          {OPEN_STAGES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </optgroup>
        <optgroup label="Closed">
          <option value="closed">Any closed</option>
          {CLOSED_STAGES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </optgroup>
      </select>

      <FilterSelect name="mode" label="Work mode" placeholder="Work mode" value={filters.mode} options={MODES} />
      <FilterSelect name="priority" label="Priority" placeholder="Priority" value={filters.priority} options={PRIORITIES} />
      <FilterSelect
        name="source"
        label="Source"
        placeholder="Source"
        value={filters.source}
        options={SOURCES.map((s) => ({ value: s, label: s }))}
      />
      <FilterSelect name="date" label="Date applied" placeholder="Date applied" value={filters.date} options={DATE_RANGES} />

      <label className={`inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm ${flexCell}`}>
        <input
          type="checkbox"
          name="archived"
          value="1"
          defaultChecked={filters.archived === "1"}
          className="m-0 size-4 accent-accent"
        />
        Show archived
      </label>

      <button type="submit" className="btn btn-primary">Apply</button>
    </form>
  );
}