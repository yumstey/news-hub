import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { ArticleMeta, buildArticleJsonLd, getArticleBySlug } from "@/entities/article"
import { categoryHref } from "@/entities/category"
import { ROUTES } from "@/shared/config"
import { buildBreadcrumbJsonLd } from "@/shared/lib/seo"
import { absoluteUrl, buildFeedHref } from "@/shared/lib/url"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Separator } from "@/shared/ui/separator"
import { Skeleton, SkeletonText } from "@/shared/ui/skeleton"
import { Heading, Text } from "@/shared/ui/typography"
import { ArticleBody, ArticleBodySkeleton } from "@/widgets/article-body"
import { PopularArticles, PopularArticlesSkeleton } from "@/widgets/popular-articles"

import { parseArticleParams } from "./_lib/params"

export { generateMetadata } from "./_lib/metadata"

type ArticlePageProps = PageProps<"/news/[category]/[slug]">

export default function Page(props: ArticlePageProps) {
  return (
    <Container>
      <Section spacing="lg">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Suspense fallback={<ArticleSkeleton />}>
            <ArticleView params={props.params} />
          </Suspense>

          <aside className="flex flex-col gap-6">
            <Suspense fallback={<PopularArticlesSkeleton />}>
              <PopularArticles title="Читают сейчас" />
            </Suspense>
          </aside>
        </div>
      </Section>
    </Container>
  )
}

async function ArticleView({ params }: Pick<ArticlePageProps, "params">) {
  const parsed = parseArticleParams(await params)

  if (parsed === null) notFound()

  const result = await getArticleBySlug("news", parsed.slug)

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  const article = result.data

  if (article.primaryCategory.slug !== parsed.category) notFound()

  const base = categoryHref(article.primaryCategory.slug)
  const permalink = `${base}/${article.slug}`

  return (
    <article className="flex flex-col gap-8">
      <JsonLd data={buildArticleJsonLd(article)} />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Главная", url: absoluteUrl(ROUTES.home) },
          { name: "Новости", url: absoluteUrl(ROUTES.news) },
          { name: article.primaryCategory.title, url: absoluteUrl(base) },
          { name: article.title, url: absoluteUrl(permalink) },
        ])}
      />

      <Stack gap="md">
        <Breadcrumbs
          items={[
            { label: "Главная", href: ROUTES.home },
            { label: "Новости", href: ROUTES.news },
            { label: article.primaryCategory.title, href: base },
            { label: article.title },
          ]}
        />

        <Link
          href={base}
          className="inline-flex h-6 w-fit items-center rounded-full bg-primary-soft px-2.5 text-overline uppercase text-primary transition-colors duration-150 hover:bg-primary hover:text-primary-foreground"
        >
          {article.primaryCategory.title}
        </Link>

        <Heading level={1}>{article.title}</Heading>

        <Text size="lead" tone="muted" className="max-w-content">
          {article.excerpt}
        </Text>

        <ArticleMeta
          author={article.author}
          publishedAt={article.timestamps.publishedAt}
          readingMinutes={article.readingMinutes}
        />
      </Stack>

      <div className="relative aspect-video w-full overflow-hidden rounded-surface bg-muted">
        <Image
          src={article.cover.url}
          alt={article.cover.alt}
          fill
          priority
          sizes="(min-width: 1024px) 60rem, 100vw"
          className="object-cover"
        />
      </div>

      <ArticleBody blocks={article.body} />

      {article.tags.length > 0 ? (
        <>
          <Separator />
          <ul className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={buildFeedHref(ROUTES.news, { tag })}
                  className="inline-flex h-8 items-center rounded-full border border-border bg-muted px-3 text-caption font-medium text-muted-foreground transition-colors duration-150 hover:border-border-strong hover:text-foreground"
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  )
}

function ArticleSkeleton() {
  return (
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
  )
}
