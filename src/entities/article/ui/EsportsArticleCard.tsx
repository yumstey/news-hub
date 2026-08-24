import Image from "next/image"
import Link from "next/link"

import { SITE } from "@/shared/config"
import { formatDate, toIsoDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { Heading, Text } from "@/shared/ui/typography"

import { esportsArticleHref } from "../lib/articleHref"
import { formatViews } from "../lib/formatViews"
import type { ArticlePreview } from "../model/article"

export type EsportsArticleCardProps = {
  article: ArticlePreview
  disciplineSlug: string
  variant?: "card" | "row"
  priority?: boolean
  className?: string
}

export function EsportsArticleCard({
  article,
  disciplineSlug,
  variant = "card",
  priority = false,
  className,
}: EsportsArticleCardProps) {
  const href = esportsArticleHref(disciplineSlug, article.slug)
  const published = article.timestamps.publishedAt

  if (variant === "row") {
    return (
      <article
        className={cn(
          "relative flex items-center gap-3 rounded-control border border-border bg-surface p-3 transition-colors duration-150 hover:border-border-strong",
          className,
        )}
      >
        <div className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-muted">
          <Image
            src={article.cover.url}
            alt={article.cover.alt}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <Heading level={3} size="subheading" className="text-sm leading-snug">
            <Link href={href} className="after:absolute after:inset-0 hover:text-primary">
              {article.title}
            </Link>
          </Heading>
          <Text size="caption" tone="subtle" className="flex flex-wrap items-center gap-x-2">
            {published ? (
              <time dateTime={toIsoDate(published)}>{formatDate(published, SITE.locale)}</time>
            ) : null}
            <span aria-hidden="true">·</span>
            <span>{formatViews(article.views, SITE.locale)} просмотров</span>
          </Text>
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-surface border border-border bg-surface transition-colors duration-150 hover:border-border-strong",
        className,
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={article.cover.url}
          alt={article.cover.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Heading level={3} size="subheading" className="text-base leading-snug">
          <Link href={href} className="after:absolute after:inset-0 hover:text-primary">
            {article.title}
          </Link>
        </Heading>
        <Text size="caption" tone="muted" clamp={2}>
          {article.excerpt}
        </Text>
        <Text size="caption" tone="subtle" className="mt-auto flex flex-wrap items-center gap-x-2 pt-1">
          <span>{article.author.name}</span>
          {published ? (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={toIsoDate(published)}>{formatDate(published, SITE.locale)}</time>
            </>
          ) : null}
        </Text>
      </div>
    </article>
  )
}
