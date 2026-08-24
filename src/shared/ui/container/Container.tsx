import type { HTMLAttributes } from "react"

import { cn } from "@/shared/lib/style"

export type ContainerElement = "div" | "section" | "header" | "footer" | "main" | "nav"
export type ContainerWidth = "page" | "content" | "narrow" | "full"

const widthClasses: Record<ContainerWidth, string> = {
  page: "max-w-page",
  content: "max-w-content",
  narrow: "max-w-narrow",
  full: "max-w-none",
}

export type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: ContainerElement
  width?: ContainerWidth
  bleed?: boolean
}

export function Container({
  as = "div",
  width = "page",
  bleed = false,
  className,
  children,
  ...rest
}: ContainerProps) {
  const Tag = as

  return (
    <Tag
      className={cn(
        "mx-auto w-full",
        widthClasses[width],
        bleed ? undefined : "px-gutter lg:px-gutter-lg",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
