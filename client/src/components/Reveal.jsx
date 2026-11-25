import { useEffect, useRef, useState } from "react";

const STAGGER_MS = 40;
const STAGGER_MAX = 6;

export default function Reveal({ as: Tag = "div", index = 0, style, children, ...props }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={shown ? "in" : "out"}
      style={{
        ...style,
        animationDelay: index < STAGGER_MAX ? `${index * STAGGER_MS}ms` : undefined,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}