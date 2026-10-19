import TextLink from "@/components/TextLink";

// Links under the form: demo account + a link to the other auth page.
export default function AuthAltLinks({ prompt, linkLabel, to }) {
  return (
    <div className="mt-6.5 grid gap-2 border-t border-rule pt-5.5 text-[14.5px]">
      <p>
        <span className="text-muted">Just looking around?</span>{" "}
        <TextLink to="/demo">Try the demo account</TextLink>
      </p>
      <p>
        <span className="text-muted">{prompt}</span>{" "}
        <TextLink to={to}>{linkLabel}</TextLink>
      </p>
    </div>
  );
}