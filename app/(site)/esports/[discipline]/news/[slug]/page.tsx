import Image from "next/image"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { ArticleMeta, buildArticleJsonLd, getArticleBySlug } from "@/entities/article"
import { disciplineSectionHref } from "@/entities/discipline"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Skeleton, SkeletonText } from "@/shared/ui/skeleton"
import { Heading, Text } from "@/shared/ui/typography"
import { ArticleBody, ArticleBodySkeleton } from "@/widgets/article-body"
import { DisciplineHeaderSkeleton } from "@/widgets/discipline-header"
import { MatchCenter, MatchCenterSkeleton } from "@/widgets/match-center"

import { breadcrumbsJsonLd, disciplineBreadcrumbs } from "../../_lib/breadcrumbs"
import { DisciplineHeaderSection } from "../../_lib/DisciplineHeaderSection"
import { resolveDiscipline } from "../../_lib/discipline"
import { buildMetadata, NOT_FOUND_METADATA } from "../../_lib/metadata"
import { esportsArticleHref } from "@/entities/article"
import { slugSchema } from "@/shared/model"

type ArticleProps = PageProps<"/esports/[discipline]/news/[slug]">

export async function generateMetadata(props: ArticleProps) {
  const { discipline, slug } = await props.params
  const parsedSlug = slugSchema.safeParse(slug)

  if (!parsedSlug.success) return NOT_FOUND_METADATA

  const result = await getArticleBySlug("esports", parsedSlug.data)

  if (!result.ok || result.data.discipline?.slug !== discipline) return NOT_FOUND_METADATA

  return buildMetadata(
    result.data.seo.title,
    result.data.seo.description,
    esportsArticleHref(discipline, result.data.slug),
  )
}

export default function Page(props: ArticleProps) {
  return (
    <>
      <Suspense fallback={<DisciplineHeaderSkeleton />}>
        <DisciplineHeaderSection params={props.params} section="news" />
      </Suspense>

      <Container>
        <Section spacing="md">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <Suspense fallback={<ArticleSkeleton />}>
              <ArticleView params={props.params} />
            </Suspense>

            <aside className="flex flex-col gap-6">
              <Suspense fallback={<MatchCenterSkeleton />}>
                <SidebarMatches params={props.params} />
              </Suspense>
            </aside>
          </div>
        </Section>
      </Container>
    </>
  )
}

async function ArticleView({ params }: Pick<ArticleProps, "params">) {
  const { slug } = await params
  const discipline = await resolveDiscipline(params)
  const parsedSlug = slugSchema.safeParse(slug)

  if (!parsedSlug.success) notFound()

  const result = await getArticleBySlug("esports", parsedSlug.data)

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  const article = result.data

  if (article.discipline?.slug !== discipline.slug) notFound()

  const crumbs = disciplineBreadcrumbs(discipline.slug, discipline.title, [
    { label: "Новости", section: "news" },
    { label: article.title },
  ])

  return (
    <article className="flex flex-col gap-8">
      <JsonLd data={buildArticleJsonLd(article)} />
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />

      <Stack gap="md">
        <Breadcrumbs items={crumbs} />
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
    </article>
  )
}

async function SidebarMatches({ params }: Pick<ArticleProps, "params">) {
  const discipline = await resolveDiscipline(params)

  return (
    <MatchCenter
      disciplineSlug={discipline.slug}
      kind="upcoming"
      limit={4}
      title="Ближайшие матчи"
      moreHref={disciplineSectionHref(discipline.slug, "matches")}
    />
  )
}

function ArticleSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <Stack gap="md">
        <Skeleton variant="text" className="h-3 w-64" />
        <Skeleton variant="text" className="h-12 w-full max-w-content" />
        <SkeletonText lines={2} className="max-w-content" />
      </Stack>
      <Skeleton variant="block" className="aspect-video w-full" />
      <ArticleBodySkeleton />
    </div>
  )
}
