const baseStyles =
  "inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-ink px-5 text-[15px] font-medium leading-none transition-colors [&_svg]:size-[18px]";

const variantStyles = {
  outline: "bg-transparent text-ink hover:bg-tint",
  primary:
    "bg-ink text-on-ink hover:border-accent hover:bg-accent hover:text-on-ink",
};

// Use `as="a"` to render a link that looks like a button.
export default function Button({
  as: Component = "button",
  variant = "outline",
  fullWidth = false,
  className = "",
  ...props
}) {
  const classes = [
    baseStyles,
    variantStyles[variant],
    fullWidth && "w-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Component className={classes} {...props} />;
}