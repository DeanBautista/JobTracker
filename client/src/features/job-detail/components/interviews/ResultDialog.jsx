import { useState } from "react";
import Field from "../../../../components/ui/Field";
import FieldGrid from "../../../../components/ui/FieldGrid";
import Modal from "../../../../components/Modal";
import { INTERVIEW_OUTCOMES } from "../../utils/detailOptions";

function ResultForm({ round, onClose, onSubmit }) {
  const [outcome, setOutcome] = useState(round.result?.outcome ?? "passed");
  const [feedback, setFeedback] = useState(round.result?.feedback ?? "");
  const [rating, setRating] = useState(round.result?.rating ?? 0);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ outcome, feedback: feedback.trim(), rating });
      }}
    >
      <Modal.Body>
        <FieldGrid>
          <Field
            as="select"
            id="result-outcome"
            label="Outcome"
            full
            required
            options={INTERVIEW_OUTCOMES}
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
          />
          <Field
            as="textarea"
            id="result-feedback"
            label="Feedback"
            full
            required
            rows={4}
            maxLength={4000}
            placeholder="What went well? What should you improve?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <fieldset className="col-span-full grid min-w-0 gap-1.5">
            <legend className="label mb-1.5">Rating</legend>
            <div className="flex flex-wrap gap-[7px]">
              {[1, 2, 3, 4, 5].map((n) => (
                <label
                  key={n}
                  className="flex min-h-10 min-w-[42px] cursor-pointer items-center justify-center gap-[5px] rounded-md border border-rule px-[9px] has-checked:border-accent has-checked:bg-accent-soft"
                >
                  <input type="radio" name="rating" className="accent-accent" required checked={rating === n} onChange={() => setRating(n)} />
                  {n}
                </label>
              ))}
            </div>
            <small className="text-xs text-muted">Rate the round from 1 to 5.</small>
          </fieldset>
        </FieldGrid>
      </Modal.Body>
      <Modal.Foot>
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save result
        </button>
      </Modal.Foot>
    </form>
  );
}

export default function ResultDialog({ open, round, onClose, onSubmit }) {
  return (
    <Modal open={open} onClose={onClose} title="Interview result" description="Record the outcome and how the round went.">
      {round && <ResultForm round={round} onClose={onClose} onSubmit={onSubmit} />}
    </Modal>
  );
}
