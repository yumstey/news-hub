import type { HTMLAttributes } from "react"

import { cn } from "@/shared/lib/style"

export type SkeletonVariant = "block" | "text" | "circle" | "control"

const variantClasses: Record<SkeletonVariant, string> = {
  block: "rounded-surface",
  text: "h-4 rounded-sm",
  circle: "rounded-full",
  control: "h-10 rounded-control",
}

export type SkeletonProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  variant?: SkeletonVariant
  animated?: boolean
}

export function Skeleton({
  variant = "block",
  animated = true,
  className,
  ...rest
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-full bg-skeleton",
        variantClasses[variant],
        animated ? "animate-pulse" : undefined,
        className,
      )}
      {...rest}
    />
  )
}

export type SkeletonTextProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  lines?: number
  animated?: boolean
}

export function SkeletonText({
  lines = 3,
  animated = true,
  className,
  ...rest
}: SkeletonTextProps) {
  const rows = Array.from({ length: Math.max(1, lines) }, (_, index) => index)

  return (
    <div className={cn("flex flex-col gap-2", className)} {...rest}>
      {rows.map((row) => (
        <Skeleton
          key={row}
          variant="text"
          animated={animated}
          className={row === rows.length - 1 && rows.length > 1 ? "w-3/5" : undefined}
        />
      ))}
    </div>
  )
}
