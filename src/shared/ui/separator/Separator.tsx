import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/shared/lib/style"

export type SeparatorOrientation = "horizontal" | "vertical"

export type SeparatorProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  orientation?: SeparatorOrientation
  decorative?: boolean
  label?: ReactNode
}

export function Separator({
  orientation = "horizontal",
  decorative = true,
  label,
  className,
  ...rest
}: SeparatorProps) {
  const semantics = decorative
    ? { role: "presentation" as const, "aria-hidden": true as const }
    : { role: "separator" as const, "aria-orientation": orientation }

  if (label && orientation === "horizontal") {
    return (
      <div
        {...semantics}
        className={cn("flex w-full items-center gap-3", className)}
        {...rest}
      >
        <span className="h-px flex-1 bg-border" />
        <span className="text-overline uppercase text-subtle-foreground">{label}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    )
  }

  return (
    <div
      {...semantics}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px self-stretch",
        className,
      )}
      {...rest}
    />
  )
}
