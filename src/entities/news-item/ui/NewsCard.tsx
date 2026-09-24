import { ExternalLink } from "lucide-react"
import Image from "next/image"

import { formatDate, toIsoDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { Text } from "@/shared/ui/typography"

import type { NewsItem } from "../model/newsItem"

function SourceBadge({ item }: { item: NewsItem }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 rounded-xs bg-muted px-1.5 py-0.5 text-overline font-bold uppercase text-muted-foreground">
        {item.source.name}
        <ExternalLink aria-hidden="true" className="size-2.5" />
      </span>
      {item.language === "en" ? (
        <span
          title="Материал на английском"
          className="rounded-xs border border-border px-1 py-px text-[0.5625rem] font-bold uppercase tracking-wider text-subtle-foreground"
        >
          EN
        </span>
      ) : null}
    </span>
  )
}

function Cover({
  item,
  fallback,
  eager,
  sizes,
}: {
  item: NewsItem
  fallback: string | null
  eager: boolean
  sizes: string
}) {
  const zoom = "object-cover transition-transform duration-300 group-hover:scale-[1.03]"

  if (item.image !== null) {
    return (
      <Image
        src={item.image.url}
        alt=""
        fill
        unoptimized={!item.image.optimize}
        loading={eager ? "eager" : undefined}
        fetchPriority={eager ? "high" : undefined}
        sizes={sizes}
        className={zoom}
      />
    )
  }

  if (fallback !== null) {
    // Своей картинки у материала нет — ставим кадр из игры с подписью источника.
    return (
      <>
        <Image src={fallback} alt="" fill quality={50} sizes={sizes} className={cn(zoom, "opacity-70")} />
        <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
        <span className="absolute bottom-2.5 left-3 text-overline font-bold uppercase tracking-wider text-white/85">
          {item.source.name}
        </span>
      </>
    )
  }

  return (
    <span className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary-soft via-elevated to-elevated">
      <span className="text-overline font-bold uppercase tracking-wider text-subtle-foreground">
        {item.source.name}
      </span>
    </span>
  )
}

export type NewsCardProps = {
  item: NewsItem
  variant?: "card" | "row" | "featured"
  /** Кадр из игры для материалов без собственной картинки. */
  fallback?: string | null
  eager?: boolean
  className?: string
}

export function NewsCard({
  item,
  variant = "card",
  fallback = null,
  eager = false,
  className,
}: NewsCardProps) {
  const meta = (
    <span className="flex flex-wrap items-center gap-2 text-caption text-subtle-foreground">
      <time dateTime={toIsoDate(item.publishedAt)} className="tabular-nums">
        {formatDate(item.publishedAt)}
      </time>
      <SourceBadge item={item} />
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
        <span className="relative hidden h-14 w-24 shrink-0 overflow-hidden rounded-sm bg-muted sm:block">
          <Cover item={item} fallback={fallback} eager={false} sizes="6rem" />
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

  if (variant === "featured") {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer external"
        className={cn(
          "group relative flex min-h-80 animate-rise-in flex-col justify-end overflow-hidden rounded-surface border border-border bg-muted sm:min-h-96",
          "transition-all duration-200 hover:border-primary/40 hover:shadow-surface",
          className,
        )}
      >
        <Cover item={item} fallback={fallback} eager={eager} sizes="(min-width: 1024px) 50rem, 100vw" />
        <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-transparent" />
        <div className="relative flex flex-col gap-2.5 p-5 text-white sm:p-7">
          <h2 className="line-clamp-3 max-w-3xl text-title font-bold leading-tight transition-colors duration-150 group-hover:text-primary">
            {item.title}
          </h2>
          {item.excerpt.length === 0 ? null : (
            <p className="line-clamp-2 max-w-2xl text-sm text-white/75">{item.excerpt}</p>
          )}
          <span className="flex flex-wrap items-center gap-2 text-caption text-white/70">
            <time dateTime={toIsoDate(item.publishedAt)} className="tabular-nums">
              {formatDate(item.publishedAt)}
            </time>
            <span className="inline-flex items-center gap-1 rounded-xs bg-white/15 px-1.5 py-0.5 text-overline font-bold uppercase text-white">
              {item.source.name}
              <ExternalLink aria-hidden="true" className="size-2.5" />
            </span>
          </span>
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
        <Cover
          item={item}
          fallback={fallback}
          eager={eager}
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
        />
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

export function NewsCardSkeleton({ variant = "card" }: { variant?: "card" | "row" | "featured" }) {
  if (variant === "row") {
    return <div className="h-20 rounded-control border border-border bg-skeleton" />
  }

  if (variant === "featured") {
    return <div className="h-80 rounded-surface border border-border bg-skeleton sm:h-96" />
  }

  return <div className="h-72 rounded-surface border border-border bg-skeleton" />
}
