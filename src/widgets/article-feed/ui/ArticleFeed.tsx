import { ArticleCard, ArticleCardSkeleton, getArticleFeed } from "@/entities/article"
import type { ArticleSort } from "@/entities/article"
import { FeedPagination } from "@/features/feed-pagination"
import type { FeedBasePath } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { EmptyState } from "@/shared/ui/empty-state"

export type ArticleFeedProps = {
  basePath: FeedBasePath
  page: number
  category?: string
  tag?: string
  sort: ArticleSort
  excludeFeatured?: boolean
  className?: string
}

export async function ArticleFeed({
  basePath,
  page,
  category,
  tag,
  sort,
  excludeFeatured = false,
  className,
}: ArticleFeedProps) {
  const result = await getArticleFeed({
    module: "news",
    page,
    ...(category ? { category } : {}),
    ...(tag ? { tag } : {}),
    sort,
  })

  if (!result.ok) {
    return (
      <EmptyState
        tone="danger"
        title="Не удалось загрузить ленту"
        description={result.error.message}
        className={className}
      />
    )
  }

  const feed = result.data
  const items =
    excludeFeatured && page === 1 && !tag
      ? feed.items.filter((article) => !article.isFeatured)
      : feed.items

  if (items.length === 0) {
    return (
      <EmptyState
        title="Материалов пока нет"
        description="Попробуйте выбрать другую рубрику или сбросить фильтр по теме."
        className={className}
      />
    )
  }

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      <FeedPagination
        basePath={basePath}
        page={feed.page}
        total={feed.total}
        perPage={feed.perPage}
        query={{ ...(tag ? { tag } : {}), sort }}
      />
    </div>
  )
}

export function ArticleFeedSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  const rows = Array.from({ length: count }, (_, index) => index)

  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {rows.map((row) => (
        <ArticleCardSkeleton key={row} />
      ))}
    </div>
  )
}
