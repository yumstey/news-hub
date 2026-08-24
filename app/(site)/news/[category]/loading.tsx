import { Container, Section, Stack } from "@/shared/ui/container"
import { Skeleton, SkeletonText } from "@/shared/ui/skeleton"
import { ArticleFeedSkeleton } from "@/widgets/article-feed"
import { CategoryNavSkeleton } from "@/widgets/category-nav"
import { PopularArticlesSkeleton } from "@/widgets/popular-articles"
import { TrendingTopicsSkeleton } from "@/widgets/trending-topics"

export default function Loading() {
  return (
    <Container>
      <Section spacing="lg">
        <Stack gap="lg">
          <Skeleton variant="text" className="h-3 w-56" />
          <Stack gap="sm">
            <Skeleton variant="text" className="h-10 w-56" />
            <SkeletonText lines={2} className="max-w-content" />
          </Stack>
          <CategoryNavSkeleton />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <ArticleFeedSkeleton />
            <aside className="flex flex-col gap-6">
              <TrendingTopicsSkeleton />
              <PopularArticlesSkeleton />
            </aside>
          </div>
        </Stack>
      </Section>
    </Container>
  )
}
