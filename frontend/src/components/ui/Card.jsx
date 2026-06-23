import { cn } from "@/lib/utils";

export default function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        "glass-panel-solid rounded-xl p-5",
        hover && "card-interactive cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return <h3 className={cn("text-sm font-semibold text-text-primary", className)}>{children}</h3>;
}

export function CardDescription({ children, className }) {
  return <p className={cn("text-xs text-text-muted mt-1", className)}>{children}</p>;
}
