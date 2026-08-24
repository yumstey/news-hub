import { cn } from "@/shared/lib/style"
import { Skeleton } from "@/shared/ui/skeleton"

export type MatchRowSkeletonProps = {
  className?: string
}

export function MatchRowSkeleton({ className }: MatchRowSkeletonProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-control border border-border bg-surface px-4 py-3",
        className,
      )}
    >
      <Skeleton variant="text" className="h-4 w-12 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton variant="text" className="h-4 w-2/3" />
        <Skeleton variant="text" className="h-4 w-1/2" />
      </div>
      <Skeleton variant="text" className="hidden h-4 w-32 shrink-0 sm:block" />
    </div>
  )
}
