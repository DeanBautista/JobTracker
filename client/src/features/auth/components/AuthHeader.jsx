// Page title + short description shown at the top of the form card.
export default function AuthHeader({ title, description }) {
  return (
    <>
      <h1 className="font-serif text-[clamp(2rem,3.4vw,2.6rem)] font-normal leading-[1.08] tracking-[-0.025em]">
        {title}
      </h1>
      <p className="mt-2.5 text-muted">{description}</p>
    </>
  );
}