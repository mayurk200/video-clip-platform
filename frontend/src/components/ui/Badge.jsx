import { cn } from "@/lib/utils";

const colorMap = {
  blue: "bg-accent-muted text-accent",
  green: "bg-success-muted text-success",
  yellow: "bg-warning-muted text-warning",
  red: "bg-danger-muted text-danger",
  neutral: "bg-white/[0.06] text-text-secondary",
  purple: "bg-[rgba(139,92,246,0.15)] text-[#A78BFA]",
};

export default function Badge({ children, color = "neutral", className, dot = false, icon: Icon }) {
  return (
    <span className={cn("badge", colorMap[color] || colorMap.neutral, className)}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-accent": color === "blue",
        "bg-success": color === "green",
        "bg-warning": color === "yellow",
        "bg-danger": color === "red",
        "bg-text-muted": color === "neutral",
        "bg-[#A78BFA]": color === "purple",
      })} />}
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

export function ScoreBadge({ score, className }) {
  const color = score >= 75 ? "green" : score >= 50 ? "yellow" : "red";
  return <Badge color={color} className={cn("font-bold", className)}>{score}</Badge>;
}
