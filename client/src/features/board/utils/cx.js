// Tiny class joiner: cx("a", cond && "b") -> "a b". Swap for clsx if you already have it.
export const cx = (...parts) => parts.filter(Boolean).join(" ");
