import type { Route } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { crateHref } from "@/entities/crate"
import {
  buildSkinJsonLd,
  CATEGORY_LABEL,
  formatUsd,
  getSkinBySlug,
  ItemImage,
  RarityBadge,
  rarityTone,
  SkinCard,
  weaponHref,
} from "@/entities/skin"
import type { Skin } from "@/entities/skin"
import { ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { AdSlot } from "@/shared/ui/ad-slot"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Skeleton } from "@/shared/ui/skeleton"
import { Heading, Text } from "@/shared/ui/typography"
import { BuyLinks, FloatRange, PriceTable } from "@/widgets/skin-market"

import { breadcrumbsJsonLd, trail } from "../../_lib/breadcrumbs"
import { resolveSlug } from "../../_lib/params"

export { generateMetadata } from "./_lib/metadata"

const TEAM_LABEL: Record<NonNullable<Skin["team"]>, string> = {
  t: "Террористы",
  ct: "Спецназ",
  both: "Обе стороны",
}

export default function Page(props: PageProps<"/skins/[slug]">) {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <Suspense fallback={<SkinSkeleton />}>
            <SkinView params={props.params} />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-2 last:border-b-0">
      <dt className="text-caption text-subtle-foreground">{label}</dt>
      <dd className="text-right text-caption font-medium text-foreground">{value}</dd>
    </div>
  )
}

async function SkinView({ params }: Pick<PageProps<"/skins/[slug]">, "params">) {
  const slug = await resolveSlug(params)
  const result = await getSkinBySlug(slug)

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  const { skin, related } = result.data
  const tone = rarityTone(skin.rarity, skin.category)
  const crumbs = trail(
    { label: "Скины", href: ROUTES.skins },
    { label: skin.weapon, href: weaponHref(skin.weaponSlug) as Route },
    { label: skin.pattern ?? skin.name },
  )

  const normal = skin.prices.filter((price) => price.variant === "normal")
  const liquid = [...normal].sort((left, right) => right.quantity - left.quantity)[0]
  const stattrak = skin.prices
    .filter((price) => price.variant === "stattrak" && price.min !== null)
    .map((price) => price.min ?? 0)

  return (
    <>
      <JsonLd data={buildSkinJsonLd(skin)} />
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative overflow-hidden rounded-surface border border-border bg-surface">
          <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", tone.bar)} />

          <ItemImage
            src={skin.image}
            alt={skin.name}
            glow={tone.glow}
            highPriority
            sizes="(min-width: 1024px) 50rem, 100vw"
            className="aspect-[16/10] w-full bg-elevated"
          />

          <div className="flex flex-col gap-3 border-t border-border p-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <RarityBadge rarity={skin.rarity} category={skin.category} />
              <Link
                href={weaponHref(skin.weaponSlug)}
                className="text-overline uppercase text-muted-foreground transition-colors duration-150 hover:text-primary"
              >
                {CATEGORY_LABEL[skin.category]} · {skin.weapon}
              </Link>
              {skin.stattrak ? (
                <span className="rounded-xs bg-muted px-1.5 py-0.5 text-overline font-bold text-stattrak">
                  StatTrak™
                </span>
              ) : null}
              {skin.souvenir ? (
                <span className="rounded-xs bg-muted px-1.5 py-0.5 text-overline font-bold text-rarity-gold">
                  Сувенирный
                </span>
              ) : null}
            </div>

            <Heading level={1} size="title" className="break-words">
              {skin.name}
              {skin.phase === null ? null : (
                <span className="ml-2 text-heading text-muted-foreground">{skin.phase}</span>
              )}
            </Heading>

            {skin.description === null ? null : (
              <Text size="body" tone="muted" className="max-w-content">
                {skin.description}
              </Text>
            )}
            {skin.lore === null ? null : (
              <Text size="caption" tone="subtle" className="max-w-content italic">
                «{skin.lore}»
              </Text>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-surface border border-border bg-surface p-5">
            <div className="flex flex-col gap-0.5">
              <span className="text-overline uppercase text-subtle-foreground">Цена сейчас</span>
              <span className="text-title font-bold tabular-nums text-foreground">
                {skin.fromPrice === null ? "Нет в продаже" : `от ${formatUsd(skin.fromPrice)}`}
              </span>
              {skin.typicalPrice === null ? null : (
                <span className="text-caption text-muted-foreground">
                  Обычно продают за {formatUsd(skin.typicalPrice)}
                </span>
              )}
              {skin.phaseAgnosticPrice ? (
                <span className="mt-1 text-caption leading-snug text-warning">
                  Маркетплейсы не разделяют фазы: цена общая для всех фаз этой раскраски.
                </span>
              ) : null}
            </div>

            <BuyLinks
              marketHashName={liquid?.marketHashName ?? skin.name}
              skinportPage={liquid?.itemPage ?? null}
            />
          </div>

          <div className="flex flex-col gap-4 rounded-surface border border-border bg-surface p-5">
            <FloatRange min={skin.minFloat} max={skin.maxFloat} />

            <dl className="flex flex-col">
              <Fact label="Лотов в продаже" value={skin.listings.toLocaleString("ru-RU")} />
              {stattrak.length === 0 ? null : (
                <Fact label="StatTrak™ от" value={formatUsd(Math.min(...stattrak))} />
              )}
              {skin.team === null ? null : <Fact label="Сторона" value={TEAM_LABEL[skin.team]} />}
            </dl>
          </div>

          <AdSlot slot="sidebar" />
        </aside>
      </div>

      <section className="flex flex-col gap-4">
        <SectionHeading title="Цены по износу" />
        <PriceTable prices={skin.prices} />
        <Text size="caption" tone="subtle">
          Минимальная цена лота и медиана недавних продаж на Skinport, USD. Обновляется каждые 30 минут.
        </Text>
      </section>

      {skin.crates.length + skin.collections.length === 0 ? null : (
        <section className="flex flex-col gap-4">
          <SectionHeading title="Где достать" />
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {skin.crates.map((crate) => (
              <li key={crate.id}>
                <Link
                  href={crateHref(crate.slug)}
                  className="flex min-h-16 items-center gap-3 rounded-control border border-border bg-surface px-3 py-2 transition-colors duration-150 hover:border-rarity-gold/50"
                >
                  {crate.image === null ? null : (
                    <Image src={crate.image} alt="" width={48} height={36} className="h-9 w-12 shrink-0 object-contain" />
                  )}
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{crate.name}</span>
                    <span className="text-overline uppercase text-subtle-foreground">Кейс · шансы и цена</span>
                  </span>
                </Link>
              </li>
            ))}
            {skin.collections.map((collection) => (
              <li
                key={collection.id}
                className="flex min-h-16 items-center gap-3 rounded-control border border-border bg-surface px-3 py-2"
              >
                {collection.image === null ? null : (
                  <Image src={collection.image} alt="" width={36} height={36} className="size-9 shrink-0 object-contain" />
                )}
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{collection.name}</span>
                  <span className="text-overline uppercase text-subtle-foreground">Коллекция</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length === 0 ? null : (
        <section className="flex flex-col gap-4">
          <SectionHeading
            title={`Другие скины на ${skin.weapon}`}
            action={
              <Link
                href={weaponHref(skin.weaponSlug)}
                className="text-caption font-medium text-primary hover:underline"
              >
                Все скины {skin.weapon}
              </Link>
            }
          />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {related.map((entry) => (
              <li key={entry.id}>
                <SkinCard skin={entry} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

function SkinSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton variant="text" className="h-3 w-full max-w-72" />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton variant="block" className="h-[32rem] w-full" />
        <Skeleton variant="block" className="h-80 w-full" />
      </div>
    </div>
  )
}
