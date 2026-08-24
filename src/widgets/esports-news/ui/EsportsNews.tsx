import Link from "next/link"

import { EsportsArticleCard, getArticleFeed } from "@/entities/article"
import { disciplineSectionHref } from "@/entities/discipline"
import { cn } from "@/shared/lib/style"
import { EmptyState } from "@/shared/ui/empty-state"
import { SectionHeading } from "@/shared/ui/section-heading"

export type EsportsNewsProps = {
  disciplineSlug: string
  page?: number
  perPage?: number
  variant?: "grid" | "list"
  title?: string
  showMore?: boolean
  className?: string
}

export async function EsportsNews({
  disciplineSlug,
  page = 1,
  perPage = 6,
  variant = "grid",
  title,
  showMore = false,
  className,
}: EsportsNewsProps) {
  const result = await getArticleFeed({ module: "esports", page, perPage })

  if (!result.ok) {
    return (
      <EmptyState
        tone="danger"
        title="Новости недоступны"
        description={result.error.message}
        className={className}
      />
    )
  }

  if (result.data.items.length === 0) {
    return <EmptyState title="Новостей пока нет" className={className} />
  }

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      {title ? (
        <SectionHeading
          title={title}
          action={
            showMore ? (
              <Link
                href={disciplineSectionHref(disciplineSlug, "news")}
                className="text-caption font-medium text-primary transition-colors duration-150 hover:text-primary-hover"
              >
                Все новости
              </Link>
            ) : null
          }
        />
      ) : null}

      {variant === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.items.map((article, index) => (
            <EsportsArticleCard
              key={article.id}
              article={article}
              disciplineSlug={disciplineSlug}
              priority={index === 0}
            />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {result.data.items.map((article) => (
            <li key={article.id}>
              <EsportsArticleCard
                article={article}
                disciplineSlug={disciplineSlug}
                variant="row"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function EsportsNewsSkeleton({
  count = 6,
  variant = "grid",
  className,
}: {
  count?: number
  variant?: "grid" | "list"
  className?: string
}) {
  const items = Array.from({ length: count }, (_, index) => index)

  if (variant === "list") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {items.map((item) => (
          <div key={item} className="h-22 rounded-control border border-border bg-skeleton" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item) => (
        <div key={item} className="h-64 rounded-surface border border-border bg-skeleton" />
      ))}
    </div>
  )
}
