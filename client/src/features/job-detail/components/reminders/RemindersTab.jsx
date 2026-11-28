import useIntro from "@/hooks/useIntro";
import Panel from "../../../../components/ui/Panel";
import SectionHeader from "../../../../components/ui/SectionHeader";
import StateCard from "../../../../components/ui/StateCard";
import TextBadge from "../../../../components/ui/TextBadge";
import ReminderRow from "./ReminderRow";

export default function RemindersTab({ job, reminders, readOnly, actions, onAdd, onEdit }) {
  const list = reminders.items;
  const open = list.filter((r) => !r.doneAt).sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
  const done = list.filter((r) => r.doneAt).sort((a, b) => new Date(b.doneAt) - new Date(a.doneAt));
  const intro = useIntro(true);

  if (reminders.status === "loading") return <p className="text-meta text-muted">Loading reminders…</p>;
  if (reminders.status === "error") {
    return (
      <StateCard
        role="alert"
        icon="!"
        title="Could not load reminders"
        message="Your reminders could not be loaded. Try again."
        action={
          <button type="button" className="btn" onClick={reminders.retry}>
            Try again
          </button>
        }
      />
    );
  }

  const row = (reminder, index) => (
    <ReminderRow
      key={reminder.id}
      reminder={reminder}
      index={index}
      intro={intro}
      readOnly={readOnly}
      onComplete={() => reminders.complete(reminder.id, !reminder.doneAt)}
      onEdit={() => onEdit(reminder)}
      onSnooze={() => reminders.snooze(reminder.id)}
      onDismiss={() => reminders.dismiss(reminder.id)}
      onDelete={() => reminders.remove(reminder.id)}
    />
  );

  return (
    <div className="grid gap-[18px]">
      <SectionHeader
        id="reminders-heading"
        title="Reminders"
        subtitle={`A reminder is always linked to ${job.title} at ${job.company}.`}
        aside={
          !readOnly && (
            <button type="button" className="btn btn-primary" onClick={onAdd}>
              ＋ Add reminder
            </button>
          )
        }
      />

      {list.length === 0 ? (
        <StateCard
          icon="◷"
          title="No reminders for this job"
          message="Add a reminder to follow up, prepare for an interview, or meet a deadline."
          action={
            !readOnly && (
              <button type="button" className="btn btn-primary" onClick={onAdd}>
                Add reminder
              </button>
            )
          }
        />
      ) : (
        <>
          <section aria-labelledby="due-reminders-heading">
            <SectionHeader
              level="sub"
              id="due-reminders-heading"
              title="Due and upcoming"
              aside={open.length > 0 && <TextBadge tone="danger">{open.length} open</TextBadge>}
            />
            {open.length === 0 ? <p className="mt-3.5 text-meta text-muted">Nothing due.</p> : <div className="mt-1.5">{open.map(row)}</div>}
          </section>

          {done.length > 0 && (
            <section aria-labelledby="completed-reminders-heading">
              <SectionHeader
                level="sub"
                id="completed-reminders-heading"
                title="Completed"
                aside={<span className="text-[12.5px] text-muted">{done.length === 1 ? "1 reminder" : `${done.length} reminders`}</span>}
              />
              <div className="mt-1.5">{done.map(row)}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
