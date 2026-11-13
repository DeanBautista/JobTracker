// Dashed card for empty / error / not-found states.
export default function StateCard({ icon, title, message, action, role = "status" }) {
  return (
    <div role={role} className="rounded-lg border border-dashed border-muted bg-surface px-6 py-12 text-center">
      <div
        aria-hidden="true"
        className="mx-auto mb-4 grid size-[42px] place-items-center rounded-full border border-rule font-serif text-xl"
      >
        {icon}
      </div>
      <h2 className="font-serif text-[1.7rem] leading-[1.15] font-normal tracking-[-0.015em]">{title}</h2>
      <p className="mx-auto mt-2.5 mb-6 max-w-[46ch] text-muted">{message}</p>
      {action}
    </div>
  );
}
