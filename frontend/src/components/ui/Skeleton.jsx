import { cn } from "@/lib/utils";

export default function Skeleton({ className, ...props }) {
  return <div className={cn("skeleton", className)} {...props} />;
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-3/4" : "w-full")} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn("glass-panel-solid rounded-xl p-5 space-y-4", className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonClipCard({ className }) {
  return (
    <div className={cn("rounded-xl overflow-hidden border border-border", className)}>
      <Skeleton className="aspect-[9/16] w-full rounded-none" />
    </div>
  );
}
