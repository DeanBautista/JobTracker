import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

export default function Brand({ className = "" }) {
  return (
    <Link
      to="/"
      aria-label="Job Tracker home"
      className={`inline-flex items-center gap-2.5 font-serif text-[19px] font-medium leading-none tracking-[-0.01em] ${className}`}
    >
      <img src={logo} alt="" className="size-8" />
      Job Tracker
    </Link>
  );
}