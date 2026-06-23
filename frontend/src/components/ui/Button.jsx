import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  accent: "btn-accent",
  danger: "btn-danger",
};

const sizes = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

const Button = forwardRef(({
  children, variant = "secondary", size = "md", icon: Icon, iconRight: IconRight,
  loading = false, className, ...props
}, ref) => {
  const isIconOnly = !children && (Icon || loading);

  return (
    <button
      ref={ref}
      className={cn(
        "btn",
        variants[variant],
        sizes[size],
        isIconOnly && "btn-icon",
        isIconOnly && (size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : ""),
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : 16} />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight size={size === "sm" ? 14 : 16} />}
    </button>
  );
});

Button.displayName = "Button";
export default Button;
