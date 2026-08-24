import Link from "next/link"

import { getTrendingTags } from "@/entities/article"
import type { FeedBasePath } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { buildFeedHref } from "@/shared/lib/url"
import { EmptyState } from "@/shared/ui/empty-state"
import { Heading, Text } from "@/shared/ui/typography"

export type TrendingTopicsProps = {
  basePath: FeedBasePath
  activeTag?: string
  limit?: number
  title?: string
  className?: string
}

export async function TrendingTopics({
  basePath,
  activeTag,
  limit = 8,
  title = "В тренде",
  className,
}: TrendingTopicsProps) {
  const result = await getTrendingTags("news", limit)

  if (!result.ok) {
    return (
      <EmptyState
        tone="danger"
        title="Темы недоступны"
        description={result.error.message}
        className={className}
      />
    )
  }

  if (result.data.length === 0) return null

  return (
    <section className={cn("rounded-surface border border-border bg-surface p-5", className)}>
      <Heading level={2} size="subheading">
        {title}
      </Heading>
      <ul className="mt-4 flex flex-wrap gap-2">
        {result.data.map((entry) => {
          const active = entry.tag === activeTag

          return (
            <li key={entry.tag}>
              <Link
                href={buildFeedHref(basePath, active ? {} : { tag: entry.tag })}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-caption font-medium transition-colors duration-150",
                  active
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-muted text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
              >
                <span>#{entry.tag}</span>
                <Text
                  as="span"
                  size="overline"
                  tone={active ? "inverted" : "subtle"}
                  className="tabular-nums"
                >
                  {entry.count}
                </Text>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function TrendingTopicsSkeleton({ limit = 8, className }: { limit?: number; className?: string }) {
  const rows = Array.from({ length: limit }, (_, index) => index)

  return (
    <div className={cn("rounded-surface border border-border bg-surface p-5", className)}>
      <div className="h-6 w-28 rounded-sm bg-skeleton" />
      <div className="mt-4 flex flex-wrap gap-2">
        {rows.map((row) => (
          <div key={row} className="h-8 w-24 rounded-full bg-skeleton" />
        ))}
      </div>
    </div>
  )
}
