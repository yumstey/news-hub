import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Route } from "next"
import Link from "next/link"

import { cn } from "@/shared/lib/style"

export type PaginationProps = {
  page: number
  pageCount: number
  basePath: Route
  label?: string
  className?: string
}

function pageHref(basePath: string, page: number): Route {
  return (page <= 1 ? basePath : `${basePath}?page=${page}`) as Route
}

function windowOf(page: number, pageCount: number): number[] {
  const span = 2
  const start = Math.max(1, Math.min(page - span, pageCount - span * 2))
  const end = Math.min(pageCount, Math.max(page + span, span * 2 + 1))
  const pages: number[] = []

  for (let index = start; index <= end; index += 1) pages.push(index)

  return pages
}

const stepClass =
  "inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-control border border-border px-3 text-sm font-medium text-foreground transition-colors duration-150 hover:border-border-strong hover:bg-muted"

const disabledClass =
  "inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-control border border-border px-3 text-sm font-medium text-subtle-foreground opacity-50"

export function Pagination({
  page,
  pageCount,
  basePath,
  label = "Постраничная навигация",
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null

  const current = Math.min(Math.max(1, page), pageCount)
  const pages = windowOf(current, pageCount)

  return (
    <nav aria-label={label} className={cn("flex items-center justify-between gap-3", className)}>
      {current > 1 ? (
        <Link href={pageHref(basePath, current - 1)} rel="prev" className={stepClass}>
          <ChevronLeft aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">Назад</span>
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          <ChevronLeft aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">Назад</span>
        </span>
      )}

      <span className="text-caption tabular-nums text-muted-foreground sm:hidden">
        {current} / {pageCount}
      </span>

      <ul className="hidden items-center gap-1 sm:flex">
        {pages.map((entry) => (
          <li key={entry}>
            <Link
              href={pageHref(basePath, entry)}
              aria-current={entry === current ? "page" : undefined}
              className={cn(
                "inline-flex h-11 min-w-11 items-center justify-center rounded-control px-3 text-sm font-medium tabular-nums transition-colors duration-150",
                entry === current
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-border-strong hover:bg-muted hover:text-foreground",
              )}
            >
              {entry}
            </Link>
          </li>
        ))}
      </ul>

      {current < pageCount ? (
        <Link href={pageHref(basePath, current + 1)} rel="next" className={stepClass}>
          <span className="hidden sm:inline">Вперёд</span>
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          <span className="hidden sm:inline">Вперёд</span>
          <ChevronRight aria-hidden="true" className="size-4" />
        </span>
      )}
    </nav>
  )
}
