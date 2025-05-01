import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-none dark:bg-primary-dark",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
