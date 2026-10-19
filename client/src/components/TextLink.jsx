import { Link } from "react-router-dom";

// Underlined inline link used inside sentences.
export default function TextLink({ className = "", ...props }) {
  return (
    <Link
      className={`underline decoration-1 underline-offset-[3px] hover:decoration-2 ${className}`}
      {...props}
    />
  );
}