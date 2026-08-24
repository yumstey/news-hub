import type { Route } from "next"
import Link from "next/link"

import type {
  ArticlePath,
  CategoryPath,
  DisciplineSectionPath,
  EsportsArticlePath,
  EventPath,
  MatchPath,
  PlayerPath,
  TeamPath,
} from "@/shared/config"
import { cn } from "@/shared/lib/style"

export type BreadcrumbLink =
  | Route
  | CategoryPath
  | ArticlePath
  | DisciplineSectionPath
  | MatchPath
  | TeamPath
  | PlayerPath
  | EventPath
  | EsportsArticlePath

export type BreadcrumbItem = {
  label: string
  href?: BreadcrumbLink
}

export type BreadcrumbsProps = {
  items: readonly BreadcrumbItem[]
  label?: string
  className?: string
}

export function Breadcrumbs({ items, label = "Хлебные крошки", className }: BreadcrumbsProps) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-muted-foreground">
        {items.map((item, index) => {
          const last = index === items.length - 1

          return (
            <li key={item.label} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-subtle-foreground">
                  /
                </span>
              ) : null}
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={cn("transition-colors duration-150 hover:text-foreground")}
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn(last && "text-foreground")}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
