import type { Route } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import {
  CATEGORY_LABEL,
  formatUsd,
  getSkinCatalog,
  getSkinWeapons,
  parseSkinQuery,
  querySkins,
  skinHref,
  skinQueryParams,
  SkinCard,
  SkinGridSkeleton,
  weaponHref,
} from "@/entities/skin"
import { ROUTES, SITE_URL } from "@/shared/config"
import { buildCollectionPageJsonLd } from "@/shared/lib/seo"
import { cn } from "@/shared/lib/style"
import { pluralize } from "@/shared/lib/text"
import { pageCount, paginate } from "@/shared/model"
import { AdSlot } from "@/shared/ui/ad-slot"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { Pagination } from "@/shared/ui/pagination"
import { Heading, Text } from "@/shared/ui/typography"
import { MarketFilters } from "@/widgets/skin-market"

import { breadcrumbsJsonLd, trail } from "../../../_lib/breadcrumbs"
import { resolvePage } from "../../../_lib/page-param"
import { resolveSlug } from "../../../_lib/params"

export { generateMetadata } from "./_lib/metadata"

const PER_PAGE = 40

export default function Page(props: PageProps<"/skins/weapons/[slug]">) {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <Suspense fallback={<SkinGridSkeleton count={20} />}>
            <WeaponView params={props.params} searchParams={props.searchParams} />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}

async function WeaponView({
  params,
  searchParams,
}: Pick<PageProps<"/skins/weapons/[slug]">, "params" | "searchParams">) {
  const slug = await resolveSlug(params)
  const [weapons, catalog, raw, page] = await Promise.all([
    getSkinWeapons(),
    getSkinCatalog(),
    searchParams,
    resolvePage(searchParams),
  ])

  if (!weapons.ok || !catalog.ok) {
    throw new Error(weapons.ok ? (catalog.ok ? "" : catalog.error.message) : weapons.error.message)
  }

  const weapon = weapons.data.find((entry) => entry.slug === slug)

  if (weapon === undefined) notFound()

  const query = { ...parseSkinQuery(raw), category: null, weaponSlug: weapon.slug }
  const all = catalog.data.filter((skin) => skin.weaponSlug === weapon.slug)
  const matched = querySkins(catalog.data, query)
  const view = paginate(matched, page, PER_PAGE)
  const basePath = weaponHref(weapon.slug)
  const priced = all.filter((skin) => skin.fromPrice !== null)
  const priciest = [...priced].sort((left, right) => (right.fromPrice ?? 0) - (left.fromPrice ?? 0))[0]
  const siblings = weapons.data.filter(
    (entry) => entry.category === weapon.category && entry.slug !== weapon.slug,
  )

  const crumbs = trail({ label: "Скины", href: ROUTES.skins }, { label: weapon.name })
  const title = `Скины на ${weapon.name}`

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: title,
          description: `Все раскраски ${weapon.name} для CS2 с ценами.`,
          url: new URL(basePath, SITE_URL).toString(),
          items: all.slice(0, 50).map((skin) => ({
            name: skin.name,
            url: new URL(skinHref(skin.slug), SITE_URL).toString(),
          })),
        })}
      />
      <Breadcrumbs items={crumbs} />

      <div className="relative flex flex-col gap-5 overflow-hidden rounded-surface border border-border bg-linear-to-br from-primary-soft via-surface to-surface p-5 sm:flex-row sm:items-center sm:p-6">
        {weapon.image === null ? null : (
          <Image
            src={weapon.image}
            alt={weapon.name}
            width={240}
            height={180}
            loading="eager"
            fetchPriority="high"
            className="h-32 w-auto shrink-0 object-contain drop-shadow-xl sm:h-40"
          />
        )}
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-overline uppercase text-subtle-foreground">
            {CATEGORY_LABEL[weapon.category]}
          </span>
          <Heading level={1} size="title">
            {title}
          </Heading>
          <Text size="caption" tone="muted" className="max-w-content">
            {pluralize(weapon.count, ["раскраска", "раскраски", "раскрасок"])} {weapon.name} в
            Counter-Strike 2. Сравнивайте цены по износу и StatTrak™, проверяйте диапазон float
            и выбирайте, где купить выгоднее.
          </Text>
          <dl className="mt-1 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <dt className="text-overline uppercase text-subtle-foreground">Дешевле всего</dt>
              <dd className="text-subheading font-bold tabular-nums">{formatUsd(weapon.fromPrice)}</dd>
            </div>
            {priciest === undefined ? null : (
              <div>
                <dt className="text-overline uppercase text-subtle-foreground">Самый дорогой</dt>
                <dd className="text-subheading font-bold tabular-nums">
                  <Link href={skinHref(priciest.slug)} className="hover:text-primary">
                    {formatUsd(priciest.fromPrice)}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <MarketFilters basePath={basePath} query={query} showCategories={false} total={matched.length} />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {view.items.map((skin, index) => (
          <li key={skin.id}>
            <SkinCard skin={skin} eager={index < 5} />
          </li>
        ))}
      </ul>

      <Pagination
        page={view.page}
        pageCount={pageCount(view.total, PER_PAGE)}
        basePath={basePath as Route}
        query={skinQueryParams(query)}
      />

      <AdSlot slot="inline" />

      {siblings.length === 0 ? null : (
        <nav aria-label="Другое оружие" className="flex flex-col gap-3">
          <span className="text-overline uppercase text-subtle-foreground">
            Другие {CATEGORY_LABEL[weapon.category].toLowerCase()}
          </span>
          <ul className="flex flex-wrap gap-2">
            {siblings.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={weaponHref(entry.slug)}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-control border border-border bg-surface px-3 text-caption font-medium text-foreground",
                    "transition-colors duration-150 hover:border-primary/40 hover:text-primary",
                  )}
                >
                  Скины на {entry.name}
                  <span className="tabular-nums text-subtle-foreground">{entry.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  )
}
