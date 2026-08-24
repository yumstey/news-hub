import { notFound } from "next/navigation"
import { Suspense } from "react"

import { articleHref, getArticleFeed, parseFeedSearchParams } from "@/entities/article"
import { categoryHref, getNewsCategoryBySlug } from "@/entities/category"
import { FeedFilter } from "@/features/feed-filter"
import { ROUTES } from "@/shared/config"
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/shared/lib/seo"
import { absoluteUrl } from "@/shared/lib/url"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Skeleton, SkeletonText } from "@/shared/ui/skeleton"
import { Heading, Text } from "@/shared/ui/typography"
import { ArticleFeed, ArticleFeedSkeleton } from "@/widgets/article-feed"
import { CategoryNav, CategoryNavSkeleton } from "@/widgets/category-nav"
import { PopularArticles, PopularArticlesSkeleton } from "@/widgets/popular-articles"
import { TrendingTopics, TrendingTopicsSkeleton } from "@/widgets/trending-topics"

import { parseCategoryParam } from "./_lib/params"

export { generateMetadata } from "./_lib/metadata"

type CategoryPageProps = PageProps<"/news/[category]">

export default function Page(props: CategoryPageProps) {
  return (
    <Container>
      <Section spacing="lg">
        <Stack gap="lg">
          <Suspense fallback={<CategoryHeaderSkeleton />}>
            <CategoryHeader params={props.params} />
          </Suspense>

          <Suspense fallback={<CategoryNavSkeleton />}>
            <CategoryNavSection params={props.params} />
          </Suspense>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Suspense fallback={<ArticleFeedSkeleton />}>
              <CategoryFeedSection params={props.params} searchParams={props.searchParams} />
            </Suspense>

            <aside className="flex flex-col gap-6">
              <Suspense fallback={<TrendingTopicsSkeleton />}>
                <TrendingSection params={props.params} searchParams={props.searchParams} />
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

async function resolveCategory(params: CategoryPageProps["params"]) {
  const { category } = await params
  const slug = parseCategoryParam(category)

  if (slug === null) notFound()

  const result = await getNewsCategoryBySlug(slug)

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  return result.data
}

async function CategoryHeader({ params }: Pick<CategoryPageProps, "params">) {
  const category = await resolveCategory(params)
  const base = categoryHref(category.slug)

  const breadcrumbs = [
    { label: "Главная", href: ROUTES.home },
    { label: "Новости", href: ROUTES.news },
    { label: category.title, href: base },
  ] as const

  return (
    <Stack gap="lg">
      <JsonLd
        data={buildBreadcrumbJsonLd(
          breadcrumbs.map((item) => ({ name: item.label, url: absoluteUrl(item.href) })),
        )}
      />
      <Breadcrumbs items={breadcrumbs} />
      <Stack gap="sm">
        <Heading level={1}>{category.title}</Heading>
        <Text size="lead" tone="muted" className="max-w-content">
          {category.description}
        </Text>
      </Stack>
    </Stack>
  )
}

function CategoryHeaderSkeleton() {
  return (
    <Stack gap="lg">
      <Skeleton variant="text" className="h-3 w-56" />
      <Stack gap="sm">
        <Skeleton variant="text" className="h-10 w-56" />
        <SkeletonText lines={2} className="max-w-content" />
      </Stack>
    </Stack>
  )
}

async function CategoryNavSection({ params }: Pick<CategoryPageProps, "params">) {
  const category = await resolveCategory(params)

  return <CategoryNav activeSlug={category.slug} />
}

async function CategoryFeedSection({ params, searchParams }: CategoryPageProps) {
  const category = await resolveCategory(params)
  const { page, tag, sort } = parseFeedSearchParams(await searchParams)
  const base = categoryHref(category.slug)

  const feed = await getArticleFeed({
    module: "news",
    page,
    category: category.slug,
    ...(tag ? { tag } : {}),
    sort,
  })

  return (
    <div className="flex flex-col gap-6">
      <FeedFilter basePath={base} sort={sort} tag={tag} />

      {feed.ok ? (
        <JsonLd
          data={buildCollectionPageJsonLd({
            name: category.title,
            description: category.seo.description,
            url: absoluteUrl(base),
            items: feed.data.items.map((article) => ({
              name: article.title,
              url: absoluteUrl(articleHref(article.primaryCategory.slug, article.slug)),
            })),
          })}
        />
      ) : null}

      <ArticleFeed basePath={base} page={page} category={category.slug} tag={tag} sort={sort} />
    </div>
  )
}

async function TrendingSection({ params, searchParams }: CategoryPageProps) {
  const category = await resolveCategory(params)
  const { tag } = parseFeedSearchParams(await searchParams)

  return <TrendingTopics basePath={categoryHref(category.slug)} activeTag={tag} />
}
