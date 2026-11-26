import useCountUp from "@/hooks/useCountUp";

export default function CountUp({
  value,
  duration,
  from,
  decimals = 0,
  format = (n) => n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
}) {
  const shown = useCountUp(value, { duration, from, decimals });
  return <>{Number.isFinite(shown) ? format(shown) : value}</>;
}