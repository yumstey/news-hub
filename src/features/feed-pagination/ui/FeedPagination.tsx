import Link from "next/link"

import type { FeedBasePath } from "@/shared/config"
import { buildFeedHref } from "@/shared/lib/url"
import type { FeedQuery } from "@/shared/lib/url"
import { cn } from "@/shared/lib/style"
import { pageCount } from "@/shared/model"

const WINDOW = 2

function visiblePages(current: number, total: number): number[] {
  const pages = new Set<number>([1, total])

  for (let offset = -WINDOW; offset <= WINDOW; offset += 1) {
    const page = current + offset
    if (page >= 1 && page <= total) pages.add(page)
  }

  return [...pages].sort((left, right) => left - right)
}

export type FeedPaginationProps = {
  basePath: FeedBasePath
  page: number
  total: number
  perPage: number
  query?: Omit<FeedQuery, "page">
  label?: string
  className?: string
}

export function FeedPagination({
  basePath,
  page,
  total,
  perPage,
  query = {},
  label = "Навигация по страницам",
  className,
}: FeedPaginationProps) {
  const pages = pageCount(total, perPage)

  if (pages <= 1) return null

  const items = visiblePages(page, pages)
  const linkClasses =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-control border px-3 text-sm font-medium transition-colors duration-150"

  return (
    <nav aria-label={label} className={cn("flex flex-wrap items-center gap-2", className)}>
      {page > 1 ? (
        <Link
          href={buildFeedHref(basePath, { ...query, page: page - 1 })}
          rel="prev"
          className={cn(linkClasses, "border-border bg-surface text-foreground hover:border-border-strong")}
        >
          Назад
        </Link>
      ) : null}

      {items.map((item, index) => {
        const previous = items[index - 1]
        const gap = previous !== undefined && item - previous > 1

        return (
          <span key={item} className="flex items-center gap-2">
            {gap ? (
              <span aria-hidden="true" className="px-1 text-muted-foreground">
                …
              </span>
            ) : null}
            <Link
              href={buildFeedHref(basePath, { ...query, page: item })}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                linkClasses,
                item === page
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {item}
            </Link>
          </span>
        )
      })}

      {page < pages ? (
        <Link
          href={buildFeedHref(basePath, { ...query, page: page + 1 })}
          rel="next"
          className={cn(linkClasses, "border-border bg-surface text-foreground hover:border-border-strong")}
        >
          Вперёд
        </Link>
      ) : null}
    </nav>
  )
}
