import type { Route } from "next"
import Link from "next/link"
import { Suspense } from "react"

import {
  getSkinCatalog,
  getSkinWeapons,
  isFiltered,
  parseSkinQuery,
  querySkins,
  skinHref,
  skinQueryParams,
  SkinCard,
  SkinGridSkeleton,
  formatUsd,
  weaponHref,
} from "@/entities/skin"
import { ROUTES, SITE_URL } from "@/shared/config"
import { buildCollectionPageJsonLd } from "@/shared/lib/seo"
import { pageCount, paginate } from "@/shared/model"
import { AdSlot } from "@/shared/ui/ad-slot"
import { Crosshair, Tag } from "lucide-react"
import { plural } from "@/shared/lib/text"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { Pagination } from "@/shared/ui/pagination"
import { Skeleton } from "@/shared/ui/skeleton"
import { HeroLinks, HeroStat, SectionHero } from "@/widgets/game-hub"
import { FaqBlock, MarketFilters } from "@/widgets/skin-market"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { resolvePage } from "../_lib/page-param"
import { SKINS_FAQ } from "./_lib/faq"
import { SKINS_DESCRIPTION, SKINS_TITLE } from "./_lib/metadata"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Скины" })
const PER_PAGE = 40
const WEAPON_LINKS = 18

const HERO_LINKS = [
  { label: "Кейсы", href: ROUTES.cases },
  { label: "Обновления", href: ROUTES.updates },
  { label: "Об игре", href: ROUTES.game },
] as const

async function HeroStats() {
  const result = await getSkinCatalog()

  if (!result.ok) return null

  const priced = result.data.filter((skin) => skin.fromPrice !== null).length

  return (
    <>
      <HeroStat
        icon={<Crosshair aria-hidden="true" className="size-4 text-subtle-foreground" />}
        value={result.data.length}
        label={plural(result.data.length, ["скин", "скина", "скинов"])}
      />
      <HeroStat
        icon={<Tag aria-hidden="true" className="size-4 text-subtle-foreground" />}
        value={priced}
        label="с ценой Skinport"
      />
    </>
  )
}

export default function Page(props: PageProps<"/skins">) {
  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />

      <SectionHero
        scene="skins"
        crumbs={<Breadcrumbs items={CRUMBS} />}
        title={SKINS_TITLE}
        description={SKINS_DESCRIPTION}
        stats={
          <Suspense fallback={null}>
            <HeroStats />
          </Suspense>
        }
        actions={<HeroLinks links={HERO_LINKS} />}
      />

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<Skeleton variant="block" className="h-20 w-full" />}>
              <WeaponStrip />
            </Suspense>

            <Suspense fallback={<SkinGridSkeleton count={20} />}>
              <Catalog searchParams={props.searchParams} />
            </Suspense>

            <AdSlot slot="inline" />

            <FaqBlock title="Скины CS2: частые вопросы" entries={SKINS_FAQ} />
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function WeaponStrip() {
  const result = await getSkinWeapons()

  if (!result.ok || result.data.length === 0) return null

  const popular = [...result.data].sort((left, right) => right.count - left.count).slice(0, WEAPON_LINKS)

  return (
    <nav aria-label="Скины по оружию" className="flex flex-col gap-2">
      <span className="text-overline uppercase text-subtle-foreground">Скины по оружию</span>
      <ul className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {popular.map((weapon) => (
          <li key={weapon.slug} className="shrink-0">
            <Link
              href={weaponHref(weapon.slug)}
              className="inline-flex h-9 items-center gap-2 rounded-control border border-border bg-surface px-3 text-caption font-medium text-foreground transition-colors duration-150 hover:border-primary/40 hover:text-primary"
            >
              {weapon.name}
              <span className="tabular-nums text-subtle-foreground">{weapon.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

async function Catalog({ searchParams }: Pick<PageProps<"/skins">, "searchParams">) {
  const [params, page] = await Promise.all([searchParams, resolvePage(searchParams)])
  const query = parseSkinQuery(params)
  const result = await getSkinCatalog()

  if (!result.ok) {
    return <EmptyState tone="danger" title="Каталог скинов недоступен" description={result.error.message} />
  }

  const matched = querySkins(result.data, query)
  const view = paginate(matched, page, PER_PAGE)
  const priced = result.data.filter((skin) => skin.fromPrice !== null)
  const top = [...priced].sort((left, right) => (right.fromPrice ?? 0) - (left.fromPrice ?? 0))[0]

  return (
    <>
      {isFiltered(query) || page > 1 ? null : (
        <JsonLd
          data={buildCollectionPageJsonLd({
            name: SKINS_TITLE,
            description: SKINS_DESCRIPTION,
            url: new URL(ROUTES.skins, SITE_URL).toString(),
            items: view.items.map((skin) => ({
              name: skin.name,
              url: new URL(skinHref(skin.slug), SITE_URL).toString(),
            })),
          })}
        />
      )}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Скинов в каталоге", value: result.data.length.toLocaleString("ru-RU") },
          { label: "С ценой сейчас", value: priced.length.toLocaleString("ru-RU") },
          {
            label: "Ножей и перчаток",
            value: result.data
              .filter((skin) => skin.category === "knives" || skin.category === "gloves")
              .length.toLocaleString("ru-RU"),
          },
          { label: "Самый дорогой скин, от", value: formatUsd(top?.fromPrice ?? null) },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 rounded-control bg-muted px-4 py-3">
            <dt className="order-2 text-overline uppercase text-subtle-foreground">{stat.label}</dt>
            <dd className="order-1 text-subheading font-bold tabular-nums text-foreground">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <MarketFilters basePath={ROUTES.skins} query={query} total={matched.length} />

      {view.items.length === 0 ? (
        <EmptyState
          title="Ничего не нашлось"
          description="Попробуйте убрать фильтры или изменить запрос."
          action={
            <Link href={ROUTES.skins as Route} className="text-caption font-semibold text-primary">
              Сбросить фильтры
            </Link>
          }
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {view.items.map((skin, index) => (
            <li key={skin.id}>
              <SkinCard skin={skin} eager={index < 5} />
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={view.page}
        pageCount={pageCount(view.total, PER_PAGE)}
        basePath={ROUTES.skins}
        query={skinQueryParams(query)}
      />
    </>
  )
}
