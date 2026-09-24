import { Star } from "lucide-react"
import type { Route } from "next"
import Link from "next/link"

import { cn } from "@/shared/lib/style"
import { TimeZoneLabel } from "@/shared/ui/local-time"
import { SectionHeading } from "@/shared/ui/section-heading"

import type { MatchFilter } from "./MatchCenter"

const FILTERS: { value: MatchFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "top", label: "Топ" },
]

export type MatchFilterBarProps = {
  title: string
  basePath: Route
  active: MatchFilter
  className?: string
}

/** Заголовок списка матчей с переключателем «Все / Топ» и подписью часового пояса. */
export function MatchFilterBar({ title, basePath, active, className }: MatchFilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <SectionHeading title={title} />
      <div className="flex items-center gap-3">
        <span className="hidden text-overline tracking-normal text-subtle-foreground sm:inline">
          Время: <TimeZoneLabel className="font-semibold text-muted-foreground" />
        </span>
        <nav aria-label="Фильтр матчей" className="inline-flex rounded-control border border-border bg-surface p-0.5">
          {FILTERS.map((filter) => {
            const selected = filter.value === active

            return (
              <Link
                key={filter.value}
                href={filter.value === "all" ? basePath : { pathname: basePath, query: { filter: filter.value } }}
                aria-current={selected ? "page" : undefined}
                scroll={false}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-[calc(var(--radius-control)-2px)] px-3 text-caption font-semibold transition-colors duration-150",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {filter.value === "top" ? (
                  <Star
                    aria-hidden="true"
                    className={cn("size-3", selected ? "fill-current" : "fill-warning text-warning")}
                  />
                ) : null}
                {filter.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

/** Значение фильтра из query-параметра: всё, кроме "top", — полный список. */
export function parseMatchFilter(value: string | string[] | undefined): MatchFilter {
  return value === "top" ? "top" : "all"
}
