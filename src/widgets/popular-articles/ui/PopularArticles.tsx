import { ArticleListItem, ArticleListItemSkeleton, getPopularArticles } from "@/entities/article"
import { cn } from "@/shared/lib/style"
import { EmptyState } from "@/shared/ui/empty-state"
import { Separator } from "@/shared/ui/separator"
import { Heading } from "@/shared/ui/typography"

export type PopularArticlesProps = {
  limit?: number
  title?: string
  className?: string
}

export async function PopularArticles({
  limit = 5,
  title = "Популярное",
  className,
}: PopularArticlesProps) {
  const result = await getPopularArticles("news", limit)

  if (!result.ok) {
    return (
      <EmptyState
        tone="danger"
        title="Подборка недоступна"
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
      <Separator className="my-4" />
      <ol className="flex flex-col gap-5">
        {result.data.map((article, index) => (
          <li key={article.id}>
            <ArticleListItem article={article} rank={index + 1} />
          </li>
        ))}
      </ol>
    </section>
  )
}

export function PopularArticlesSkeleton({
  limit = 5,
  className,
}: {
  limit?: number
  className?: string
}) {
  const rows = Array.from({ length: limit }, (_, index) => index)

  return (
    <div className={cn("rounded-surface border border-border bg-surface p-5", className)}>
      <div className="h-6 w-32 rounded-sm bg-skeleton" />
      <Separator className="my-4" />
      <div className="flex flex-col gap-5">
        {rows.map((row) => (
          <ArticleListItemSkeleton key={row} />
        ))}
      </div>
    </div>
  )
}
