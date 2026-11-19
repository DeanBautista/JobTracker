import { useState } from "react";
import CheckboxFilterMenu from "../shared/CheckboxFilterMenu";
import { PRIORITIES, WORK_MODES } from "../../utils/boardStages";

/**
 * Edits a draft; nothing changes on the board until Apply, like the original form.
 * Mount it with key={JSON.stringify(filters)} so the draft resets when the URL changes.
 */
export default function BoardFilters({ filters, onApply, onClear }) {
  const [draft, setDraft] = useState(filters);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onApply(draft);
      }}
      className="mb-3 flex flex-wrap items-center gap-2.5"
    >
      <div className="relative min-w-40 flex-[1_1_220px] max-[700px]:basis-full">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="absolute top-1/2 left-3 size-[15px] -translate-y-1/2 text-muted">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          className="field w-full pl-9 placeholder:text-muted"
          type="search"
          name="q"
          value={draft.q}
          onChange={(e) => setDraft({ ...draft, q: e.target.value })}
          placeholder="Search jobs or companies"
          aria-label="Search jobs or companies"
          autoComplete="off"
        />
      </div>

      <CheckboxFilterMenu label="Work mode" options={WORK_MODES} value={draft.mode} onChange={(mode) => setDraft({ ...draft, mode })} />
      <CheckboxFilterMenu label="Priority" options={PRIORITIES} value={draft.priority} onChange={(priority) => setDraft({ ...draft, priority })} />

      <div className="ml-auto flex items-center gap-3.5 max-[700px]:ml-0 max-[700px]:w-full">
        <button type="button" onClick={onClear} className="link inline-flex min-h-10 cursor-pointer items-center text-[13.5px]">
          Clear filters
        </button>
        <button type="submit" className="btn btn-primary min-w-[72px]">Apply</button>
      </div>
    </form>
  );
}
