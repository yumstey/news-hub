import { ArticleCard, ArticleCardSkeleton, getFeaturedArticles } from "@/entities/article"
import { cn } from "@/shared/lib/style"
import { EmptyState } from "@/shared/ui/empty-state"

export type FeaturedArticleProps = {
  className?: string
}

export async function FeaturedArticle({ className }: FeaturedArticleProps) {
  const result = await getFeaturedArticles("news", 3)

  if (!result.ok) {
    return (
      <EmptyState
        tone="danger"
        title="Главный материал недоступен"
        description={result.error.message}
        className={className}
      />
    )
  }

  const [lead, ...rest] = result.data

  if (!lead) return null

  return (
    <div className={cn("grid gap-6 lg:grid-cols-3", className)}>
      <ArticleCard article={lead} featured priority className="lg:col-span-2" />

      {rest.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function FeaturedArticleSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-6 lg:grid-cols-3", className)}>
      <ArticleCardSkeleton featured className="lg:col-span-2" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
        <ArticleCardSkeleton />
        <ArticleCardSkeleton />
      </div>
    </div>
  )
}
