import { Suspense } from "react"

import { getNewsFeed, NewsCard } from "@/entities/news-item"
import { ROUTES } from "@/shared/config"
import { pageCount } from "@/shared/model"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { Pagination } from "@/shared/ui/pagination"
import { SectionHero } from "@/widgets/game-hub"
import { NewsFeedSkeleton } from "@/widgets/news-feed"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { resolvePage } from "../_lib/page-param"
import { NEWS_DESCRIPTION, NEWS_TITLE } from "./_lib/metadata"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Новости" })
const PER_PAGE = 9

export default function Page(props: PageProps<"/news">) {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />
          <Breadcrumbs items={CRUMBS} />

          <SectionHero scene="news" title={NEWS_TITLE} description={<>{NEWS_DESCRIPTION} Материалы публикуются HLTV — заголовок ведёт на источник.</>} />

          <Suspense fallback={<NewsFeedSkeleton count={PER_PAGE} />}>
            <NewsList searchParams={props.searchParams} />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}

async function NewsList({ searchParams }: Pick<PageProps<"/news">, "searchParams">) {
  const page = await resolvePage(searchParams)
  const result = await getNewsFeed({ page, perPage: PER_PAGE })

  if (!result.ok) {
    return (
      <EmptyState tone="danger" title="Новости недоступны" description={result.error.message} />
    )
  }

  if (result.data.items.length === 0) return <EmptyState title="Новостей пока нет" />

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: NEWS_TITLE,
    numberOfItems: result.data.items.length,
    itemListElement: result.data.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url,
      name: item.title,
    })),
  }

  return (
    <>
      <JsonLd data={itemList} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.data.items.map((item, index) => (
          <NewsCard key={item.id} item={item} eager={index === 0} />
        ))}
      </div>

      <Pagination
        page={result.data.page}
        pageCount={pageCount(result.data.total, PER_PAGE)}
        basePath={ROUTES.news}
      />
    </>
  )
}
