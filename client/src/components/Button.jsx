const baseStyles =
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-ink font-medium leading-none transition-colors [&_svg]:size-[18px]";

const sizeStyles = {
  md: "min-h-[46px] px-5 text-[15px]",
  sm: "min-h-[34px] px-3 text-[13px]",
};

const variantStyles = {
  outline: "bg-transparent text-ink hover:bg-tint",
  primary:
    "bg-ink text-on-ink hover:border-accent hover:bg-accent hover:text-on-ink",
};

// Use `as="a"` to render a link that looks like a button.
export default function Button({
  as: Component = "button",
  variant = "outline",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}) {
  const classes = [
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    fullWidth && "w-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Component className={classes} {...props} />;
}