import type { HTMLAttributes } from "react"

import { cn } from "@/shared/lib/style"

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "soft"
  | "outline"
  | "live"
  | "success"
  | "warning"
  | "danger"
export type BadgeSize = "sm" | "md"

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  primary: "border-transparent bg-primary text-primary-foreground",
  soft: "border-transparent bg-primary-soft text-primary",
  outline: "border-border-strong bg-transparent text-foreground",
  live: "border-transparent bg-live text-live-foreground",
  success: "border-transparent bg-success-soft text-success",
  warning: "border-transparent bg-warning-soft text-warning-foreground",
  danger: "border-transparent bg-danger-soft text-danger",
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: "h-5 gap-1 px-2 text-overline uppercase",
  md: "h-6 gap-1.5 px-2.5 text-caption font-medium",
}

const dotClasses: Record<BadgeVariant, string> = {
  neutral: "bg-muted-foreground",
  primary: "bg-primary-foreground",
  soft: "bg-primary",
  outline: "bg-foreground",
  live: "bg-live-foreground",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  pulse?: boolean
}

export function Badge({
  variant = "neutral",
  size = "sm",
  dot = false,
  pulse = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            dotClasses[variant],
            pulse ? "animate-pulse" : undefined,
          )}
        />
      ) : null}
      {children}
    </span>
  )
}
