import Link from "next/link"

import { SITE } from "@/shared/config"
import { formatDate, toIsoDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { Heading, Text } from "@/shared/ui/typography"

import { articleHref } from "../lib/articleHref"
import { formatViews } from "../lib/formatViews"
import type { ArticlePreview } from "../model/article"

export type ArticleListItemProps = {
  article: ArticlePreview
  rank?: number
  className?: string
}

export function ArticleListItem({ article, rank, className }: ArticleListItemProps) {
  return (
    <article className={cn("relative flex gap-4", className)}>
      {rank === undefined ? null : (
        <span
          aria-hidden="true"
          className="w-6 shrink-0 text-heading font-bold leading-none text-border-strong"
        >
          {rank}
        </span>
      )}

      <div className="flex min-w-0 flex-col gap-1.5">
        <Heading level={3} size="subheading" className="text-sm leading-snug">
          <Link
            href={articleHref(article.primaryCategory.slug, article.slug)}
            className="transition-colors duration-150 after:absolute after:inset-0 hover:text-primary"
          >
            {article.title}
          </Link>
        </Heading>

        <Text size="caption" tone="subtle" className="flex flex-wrap items-center gap-x-2">
          <span>{article.primaryCategory.title}</span>
          <span aria-hidden="true">·</span>
          <span>{formatViews(article.views, SITE.locale)} просмотров</span>
          {article.timestamps.publishedAt ? (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={toIsoDate(article.timestamps.publishedAt)}>
                {formatDate(article.timestamps.publishedAt, SITE.locale)}
              </time>
            </>
          ) : null}
        </Text>
      </div>
    </article>
  )
}
