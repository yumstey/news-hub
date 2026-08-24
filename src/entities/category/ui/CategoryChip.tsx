import Link from "next/link"

import { cn } from "@/shared/lib/style"

import { categoryHref } from "../lib/categoryHref"

export type CategoryChipProps = {
  slug: string
  title: string
  active?: boolean
  className?: string
}

export function CategoryChip({ slug, title, active = false, className }: CategoryChipProps) {
  return (
    <Link
      href={categoryHref(slug)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border px-3 text-caption font-medium transition-colors duration-150",
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
        className,
      )}
    >
      {title}
    </Link>
  )
}
