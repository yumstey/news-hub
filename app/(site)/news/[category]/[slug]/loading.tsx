import { Container, Section, Stack } from "@/shared/ui/container"
import { Skeleton, SkeletonText } from "@/shared/ui/skeleton"
import { ArticleBodySkeleton } from "@/widgets/article-body"
import { PopularArticlesSkeleton } from "@/widgets/popular-articles"

export default function Loading() {
  return (
    <Container>
      <Section spacing="lg">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex flex-col gap-8">
            <Stack gap="md">
              <Skeleton variant="text" className="h-3 w-64" />
              <Skeleton variant="text" className="h-6 w-28 rounded-full" />
              <Skeleton variant="text" className="h-12 w-full max-w-content" />
              <SkeletonText lines={2} className="max-w-content" />
            </Stack>
            <Skeleton variant="block" className="aspect-video w-full" />
            <ArticleBodySkeleton />
          </div>
          <aside className="flex flex-col gap-6">
            <PopularArticlesSkeleton />
          </aside>
        </div>
      </Section>
    </Container>
  )
}
