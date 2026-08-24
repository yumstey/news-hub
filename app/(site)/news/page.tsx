import { Suspense } from "react"

import { articleHref, getArticleFeed, parseFeedSearchParams } from "@/entities/article"
import { FeedFilter } from "@/features/feed-filter"
import { ROUTES } from "@/shared/config"
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/shared/lib/seo"
import { absoluteUrl } from "@/shared/lib/url"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import type { BreadcrumbItem } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Heading, Text } from "@/shared/ui/typography"
import { ArticleFeed, ArticleFeedSkeleton } from "@/widgets/article-feed"
import { CategoryNav, CategoryNavSkeleton } from "@/widgets/category-nav"
import { FeaturedArticle, FeaturedArticleSkeleton } from "@/widgets/featured-article"
import { PopularArticles, PopularArticlesSkeleton } from "@/widgets/popular-articles"
import { TrendingTopics, TrendingTopicsSkeleton } from "@/widgets/trending-topics"

import { NEWS_DESCRIPTION, NEWS_TITLE } from "./_lib/metadata"

export { generateMetadata } from "./_lib/metadata"

const BREADCRUMBS: BreadcrumbItem[] = [
  { label: "Главная", href: ROUTES.home },
  { label: NEWS_TITLE, href: ROUTES.news },
]

export default function Page(props: PageProps<"/news">) {
  return (
    <Container>
      <Section spacing="lg">
        <JsonLd
          data={buildBreadcrumbJsonLd(
            BREADCRUMBS.map((item) => ({
              name: item.label,
              url: absoluteUrl(item.href ?? ROUTES.home),
            })),
          )}
        />

        <Stack gap="lg">
          <Breadcrumbs items={BREADCRUMBS} />

          <Stack gap="sm">
            <Heading level={1}>{NEWS_TITLE}</Heading>
            <Text size="lead" tone="muted" className="max-w-content">
              {NEWS_DESCRIPTION}
            </Text>
          </Stack>

          <Suspense fallback={<CategoryNavSkeleton />}>
            <CategoryNav />
          </Suspense>

          <Suspense fallback={<FeaturedArticleSkeleton />}>
            <FeaturedArticle />
          </Suspense>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Suspense fallback={<ArticleFeedSkeleton />}>
              <NewsFeedSection searchParams={props.searchParams} />
            </Suspense>

            <aside className="flex flex-col gap-6">
              <Suspense fallback={<TrendingTopicsSkeleton />}>
                <TrendingSection searchParams={props.searchParams} />
              </Suspense>
              <Suspense fallback={<PopularArticlesSkeleton />}>
                <PopularArticles />
              </Suspense>
            </aside>
          </div>
        </Stack>
      </Section>
    </Container>
  )
}

async function NewsFeedSection({ searchParams }: Pick<PageProps<"/news">, "searchParams">) {
  const { page, tag, sort } = parseFeedSearchParams(await searchParams)

  return (
    <div className="flex flex-col gap-6">
      <FeedFilter basePath={ROUTES.news} sort={sort} tag={tag} />
      <FeedJsonLd page={page} tag={tag} sort={sort} />
      <ArticleFeed basePath={ROUTES.news} page={page} tag={tag} sort={sort} excludeFeatured />
    </div>
  )
}

async function TrendingSection({ searchParams }: Pick<PageProps<"/news">, "searchParams">) {
  const { tag } = parseFeedSearchParams(await searchParams)

  return <TrendingTopics basePath={ROUTES.news} activeTag={tag} />
}

async function FeedJsonLd({
  page,
  tag,
  sort,
}: {
  page: number
  tag?: string
  sort: "latest" | "popular"
}) {
  const result = await getArticleFeed({
    module: "news",
    page,
    ...(tag ? { tag } : {}),
    sort,
  })

  if (!result.ok) return null

  return (
    <JsonLd
      data={buildCollectionPageJsonLd({
        name: NEWS_TITLE,
        description: NEWS_DESCRIPTION,
        url: absoluteUrl(ROUTES.news),
        items: result.data.items.map((article) => ({
          name: article.title,
          url: absoluteUrl(articleHref(article.primaryCategory.slug, article.slug)),
        })),
      })}
    />
  )
}
