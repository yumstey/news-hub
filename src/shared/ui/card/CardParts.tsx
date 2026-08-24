import type { HTMLAttributes } from "react"

import { cn } from "@/shared/lib/style"

export type CardMediaAspect = "wide" | "video" | "square" | "portrait"

const aspectClasses: Record<CardMediaAspect, string> = {
  wide: "aspect-[21/9]",
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
}

export type CardMediaProps = HTMLAttributes<HTMLDivElement> & {
  aspect?: CardMediaAspect
}

export function CardMedia({
  aspect = "video",
  className,
  children,
  ...rest
}: CardMediaProps) {
  return (
    <div
      className={cn("relative w-full overflow-hidden bg-muted", aspectClasses[aspect], className)}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-2 p-5 pb-0", className)} {...rest}>
      {children}
    </div>
  )
}

export function CardBody({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-3 p-5", className)} {...rest}>
      {children}
    </div>
  )
}

export function CardFooter({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-auto flex items-center gap-3 border-t border-border px-5 py-4",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
