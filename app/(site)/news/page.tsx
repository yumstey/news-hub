import type { Route } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { FEEDS, getNewsFeed, NEWS_LANGUAGE_LABEL, NewsCard, NewsCardSkeleton } from "@/entities/news-item"
import type { NewsLanguage } from "@/entities/news-item"
import { ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { pageCount } from "@/shared/model"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { Pagination } from "@/shared/ui/pagination"
import { Text } from "@/shared/ui/typography"
import { HeroLinks, SectionHero } from "@/widgets/game-hub"
import { loadNewsArt, newsCover, NewsFeedSkeleton } from "@/widgets/news-feed"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { resolvePage } from "../_lib/page-param"
import { NEWS_DESCRIPTION, NEWS_TITLE } from "./_lib/metadata"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Новости" })
const PER_PAGE = 12
const SOURCES = [...new Set(FEEDS.map((feed) => feed.source.name))].join(", ")

type LanguageFilter = NewsLanguage | "all"

const TABS: { value: LanguageFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "ru", label: NEWS_LANGUAGE_LABEL.ru },
  { value: "en", label: NEWS_LANGUAGE_LABEL.en },
]

function tabHref(value: LanguageFilter): Route | { pathname: Route; query: { lang: string } } {
  return value === "all" ? ROUTES.news : { pathname: ROUTES.news, query: { lang: value } }
}

function LanguageTabs({ active }: { active: LanguageFilter }) {
  return (
    <nav aria-label="Язык материалов" className="inline-flex self-start rounded-control border border-border bg-surface p-0.5">
      {TABS.map((tab) => (
        <Link
          key={tab.value}
          href={tabHref(tab.value)}
          aria-current={tab.value === active ? "page" : undefined}
          scroll={false}
          className={cn(
            "inline-flex h-8 items-center rounded-[calc(var(--radius-control)-2px)] px-3 text-caption font-semibold transition-colors duration-150",
            tab.value === active
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}

const HERO_LINKS = [
  { label: "Видео", href: ROUTES.videos },
  { label: "Матчи", href: ROUTES.matches },
  { label: "Обновления", href: ROUTES.updates },
] as const

export default function Page(props: PageProps<"/news">) {
  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />

      <SectionHero
        scene="news"
        crumbs={<Breadcrumbs items={CRUMBS} />}
        title={NEWS_TITLE}
        description={NEWS_DESCRIPTION}
        actions={<HeroLinks links={HERO_LINKS} />}
      />

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense
              fallback={
                <>
                  <LanguageTabs active="all" />
                  <NewsCardSkeleton variant="featured" />
                  <NewsFeedSkeleton count={6} />
                </>
              }
            >
              <NewsList searchParams={props.searchParams} />
            </Suspense>

            <Text size="caption" tone="subtle">
              Материалы собираются из открытых RSS-лент: {SOURCES}. Заголовок ведёт на первоисточник,
              права на тексты и фотографии принадлежат их авторам.
            </Text>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function NewsList({ searchParams }: Pick<PageProps<"/news">, "searchParams">) {
  const [page, params] = await Promise.all([resolvePage(searchParams), searchParams])
  const active: LanguageFilter = params.lang === "ru" || params.lang === "en" ? params.lang : "all"
  const [result, art] = await Promise.all([
    getNewsFeed({ page, perPage: PER_PAGE, language: active === "all" ? undefined : active }),
    loadNewsArt(),
  ])

  if (!result.ok) {
    return (
      <EmptyState tone="danger" title="Новости недоступны" description={result.error.message} />
    )
  }

  const { items } = result.data

  if (items.length === 0) {
    return (
      <>
        <LanguageTabs active={active} />
        <EmptyState title="Новостей пока нет" />
      </>
    )
  }

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: NEWS_TITLE,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url,
      name: item.title,
    })),
  }

  // На первой странице главный материал — самый свежий с собственной картинкой.
  const leadIndex = page === 1 ? items.findIndex((item) => item.image !== null) : -1
  const lead = leadIndex < 0 ? undefined : items[leadIndex]
  const rest = lead === undefined ? items : items.filter((_, index) => index !== leadIndex)
  const side = lead === undefined ? [] : rest.slice(0, 3)
  const grid = lead === undefined ? rest : rest.slice(3)

  return (
    <>
      <JsonLd data={itemList} />
      <LanguageTabs active={active} />

      {lead === undefined ? null : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <NewsCard item={lead} variant="featured" eager />
          <ul className="flex flex-col gap-2">
            {side.map((item) => (
              <li key={item.id}>
                <NewsCard item={item} variant="row" fallback={newsCover(item, art)} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {grid.map((item, index) => (
          <NewsCard
            key={item.id}
            item={item}
            fallback={newsCover(item, art)}
            eager={lead === undefined && index === 0}
          />
        ))}
      </div>

      <Pagination
        page={result.data.page}
        pageCount={pageCount(result.data.total, PER_PAGE)}
        basePath={ROUTES.news}
        query={active === "all" ? {} : { lang: active }}
      />
    </>
  )
}
