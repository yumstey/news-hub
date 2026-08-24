import { cn } from "@/shared/lib/style"
import type { ClassValue } from "@/shared/lib/style"

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm"

const baseClasses =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
  outline:
    "border border-border-strong bg-transparent text-foreground hover:bg-muted",
  ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "bg-danger text-danger-foreground hover:bg-danger-hover",
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-caption",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "size-10",
  "icon-sm": "size-8",
}

export type ButtonClassNameOptions = {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: ClassValue
}

export function buttonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonClassNameOptions = {}): string {
  return cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : undefined,
    className,
  )
}
