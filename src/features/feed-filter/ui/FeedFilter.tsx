"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import type { FeedBasePath } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { buildFeedHref } from "@/shared/lib/url"

const SORT_OPTIONS = [
  { value: "latest", label: "Свежее" },
  { value: "popular", label: "Популярное" },
] as const

export type FeedFilterProps = {
  basePath: FeedBasePath
  sort: string
  tag?: string
  className?: string
}

export function FeedFilter({ basePath, sort, tag, className }: FeedFilterProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const select = (next: string) => {
    startTransition(() => {
      router.push(buildFeedHref(basePath, { sort: next, ...(tag ? { tag } : {}) }))
    })
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div
        role="group"
        aria-label="Сортировка ленты"
        aria-busy={pending}
        className="inline-flex items-center gap-1 rounded-control bg-muted p-1"
      >
        {SORT_OPTIONS.map((option) => {
          const active = option.value === sort

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              disabled={pending}
              onClick={() => select(option.value)}
              className={cn(
                "rounded-[calc(var(--radius-control)-0.25rem)] px-3 py-1.5 text-caption font-medium transition-colors duration-150 disabled:opacity-60",
                active
                  ? "bg-surface text-foreground shadow-surface"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {tag ? (
        <Link
          href={buildFeedHref(basePath, { sort })}
          className="inline-flex h-8 items-center gap-2 rounded-full border border-border-strong px-3 text-caption font-medium text-foreground transition-colors duration-150 hover:bg-muted"
        >
          <span>#{tag}</span>
          <span aria-hidden="true">×</span>
          <span className="sr-only">Сбросить фильтр по теме</span>
        </Link>
      ) : null}
    </div>
  )
}
