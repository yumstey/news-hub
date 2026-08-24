import type { HTMLAttributes } from "react"

import { cn } from "@/shared/lib/style"

export type CardElement = "div" | "article" | "section" | "li"
export type CardVariant = "elevated" | "outline" | "ghost"

const variantClasses: Record<CardVariant, string> = {
  elevated: "border-border bg-surface shadow-surface",
  outline: "border-border bg-surface",
  ghost: "border-transparent bg-transparent",
}

export type CardProps = HTMLAttributes<HTMLElement> & {
  as?: CardElement
  variant?: CardVariant
  interactive?: boolean
}

export function Card({
  as = "div",
  variant = "outline",
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  const Tag = as

  return (
    <Tag
      className={cn(
        "flex flex-col overflow-hidden rounded-surface border text-foreground",
        variantClasses[variant],
        interactive
          ? "transition-colors duration-150 hover:border-border-strong focus-within:border-border-strong"
          : undefined,
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
