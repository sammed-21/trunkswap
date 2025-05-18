import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-secondary dark:bg-primary-dark",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
