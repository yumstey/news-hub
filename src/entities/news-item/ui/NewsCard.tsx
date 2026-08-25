import { ExternalLink, Newspaper } from "lucide-react"
import Image from "next/image"

import { formatDate, toIsoDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { Text } from "@/shared/ui/typography"

import type { NewsItem } from "../model/newsItem"

function SourceBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-xs bg-muted px-1.5 py-0.5 text-overline font-bold uppercase text-muted-foreground">
      {name}
      <ExternalLink aria-hidden="true" className="size-2.5" />
    </span>
  )
}

function Cover({ item, priority }: { item: NewsItem; priority: boolean }) {
  if (item.image !== null) {
    return (
      <Image
        src={item.image.url}
        alt=""
        fill
        priority={priority}
        sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    )
  }

  return (
    <span className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary-soft via-elevated to-elevated">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-8 size-32 rounded-full bg-primary/15 blur-2xl"
      />
      <span className="relative flex flex-col items-center gap-2">
        <Newspaper aria-hidden="true" className="size-7 text-border-strong" />
        <span className="text-overline font-bold uppercase tracking-wider text-subtle-foreground">
          {item.source.name}
        </span>
      </span>
    </span>
  )
}

export type NewsCardProps = {
  item: NewsItem
  variant?: "card" | "row"
  priority?: boolean
  className?: string
}

export function NewsCard({ item, variant = "card", priority = false, className }: NewsCardProps) {
  const meta = (
    <span className="flex flex-wrap items-center gap-2 text-caption text-subtle-foreground">
      <time dateTime={toIsoDate(item.publishedAt)} className="tabular-nums">
        {formatDate(item.publishedAt)}
      </time>
      <SourceBadge name={item.source.name} />
    </span>
  )

  if (variant === "row") {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer external"
        className={cn(
          "group flex min-h-20 animate-rise-in items-center gap-3 rounded-control border border-border bg-surface p-3",
          "transition-all duration-200 hover:-translate-y-px hover:border-border-strong hover:bg-muted/60 hover:shadow-surface",
          className,
        )}
      >
        <span className="relative hidden h-14 w-24 shrink-0 overflow-hidden rounded-sm sm:block">
          <Cover item={item} priority={false} />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
            {item.title}
          </h3>
          {meta}
        </div>
      </a>
    )
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer external"
      className={cn(
        "group flex h-full animate-rise-in flex-col overflow-hidden rounded-surface border border-border bg-surface",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-surface",
        className,
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Cover item={item} priority={priority} />
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 py-3.5">
        <h3 className="line-clamp-2 text-subheading text-foreground transition-colors duration-150 group-hover:text-primary">
          {item.title}
        </h3>
        {item.excerpt.length === 0 ? null : (
          <Text size="caption" tone="muted" clamp={2}>
            {item.excerpt}
          </Text>
        )}
        <span className="mt-auto pt-1">{meta}</span>
      </div>
    </a>
  )
}

export function NewsCardSkeleton({ variant = "card" }: { variant?: "card" | "row" }) {
  if (variant === "row") {
    return <div className="h-20 rounded-control border border-border bg-skeleton" />
  }

  return <div className="h-72 rounded-surface border border-border bg-skeleton" />
}
