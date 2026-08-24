import type { HTMLAttributes } from "react"

import { cn } from "@/shared/lib/style"

export type StackDirection = "vertical" | "horizontal"
export type StackGap = "none" | "xs" | "sm" | "md" | "lg" | "xl"
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline"
export type StackJustify = "start" | "center" | "end" | "between"

const gapClasses: Record<StackGap, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-stack",
  lg: "gap-8",
  xl: "gap-12",
}

const alignClasses: Record<StackAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
}

const justifyClasses: Record<StackJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
}

export type StackProps = HTMLAttributes<HTMLDivElement> & {
  direction?: StackDirection
  gap?: StackGap
  align?: StackAlign
  justify?: StackJustify
  wrap?: boolean
}

export function Stack({
  direction = "vertical",
  gap = "md",
  align,
  justify,
  wrap = false,
  className,
  children,
  ...rest
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        gapClasses[gap],
        align ? alignClasses[align] : undefined,
        justify ? justifyClasses[justify] : undefined,
        wrap ? "flex-wrap" : undefined,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
