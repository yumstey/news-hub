import { ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { buildCrateJsonLd, getCrateBySlug, KEY_PRICE, RARE_LABEL } from "@/entities/crate"
import type { CrateItem, CrateRarityGroup } from "@/entities/crate"
import { formatUsd, RARITY_LABEL, rarityTone, skinHref } from "@/entities/skin"
import { AFFILIATE_DISCLOSURE, marketUrl, ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { AdSlot } from "@/shared/ui/ad-slot"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { buttonClassName } from "@/shared/ui/button"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Skeleton } from "@/shared/ui/skeleton"
import { Heading, Text } from "@/shared/ui/typography"

import { breadcrumbsJsonLd, trail } from "../../_lib/breadcrumbs"
import { resolveSlug } from "../../_lib/params"

export { generateMetadata } from "./_lib/metadata"

const released = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" })
const percent = (value: number) =>
  `${(value * 100).toLocaleString("ru-RU", { maximumFractionDigits: 2 })}%`

export default function Page(props: PageProps<"/cases/[slug]">) {
  return (
    <Container>
      <Section spacing="md">
        <Stack gap="lg">
          <Suspense fallback={<CaseSkeleton />}>
            <CaseView params={props.params} />
          </Suspense>
        </Stack>
      </Section>
    </Container>
  )
}

function groupTone(group: CrateRarityGroup) {
  return group.rarity === "rare" ? rarityTone("extraordinary", "knives") : rarityTone(group.rarity)
}

function ItemTile({ item, rare }: { item: CrateItem; rare: boolean }) {
  const tone = rare ? rarityTone("extraordinary", "knives") : rarityTone(item.rarity)
  const body = (
    <>
      <span aria-hidden="true" className={cn("absolute inset-x-0 bottom-0 h-0.5", tone.bar)} />
      <span className="relative block aspect-[4/3] w-full">
        <span
          aria-hidden="true"
          className={cn("absolute inset-0 bg-radial-[at_50%_60%] via-transparent to-transparent", tone.glow)}
        />
        {item.image === null ? null : (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 12rem, 40vw"
            className="object-contain p-[10%]"
          />
        )}
      </span>
      <span className="flex flex-col gap-0.5 px-2.5 pb-2.5">
        <span className="line-clamp-2 text-caption font-medium leading-snug text-foreground">
          {item.name.replace(/^★\s*/, "")}
        </span>
        <span className="text-caption font-bold tabular-nums text-muted-foreground">
          {item.price === null ? "—" : `~${formatUsd(item.price)}`}
        </span>
      </span>
    </>
  )

  const className =
    "group relative flex h-full flex-col overflow-hidden rounded-control border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-surface"

  return item.slug === null ? (
    <div className={className}>{body}</div>
  ) : (
    <Link href={skinHref(item.slug)} className={className}>
      {body}
    </Link>
  )
}

async function CaseView({ params }: Pick<PageProps<"/cases/[slug]">, "params">) {
  const slug = await resolveSlug(params)
  const result = await getCrateBySlug(slug)

  if (!result.ok) {
    if (result.error.kind === "not-found") notFound()
    throw new Error(result.error.message)
  }

  const crate = result.data
  const crumbs = trail({ label: "Кейсы", href: ROUTES.cases }, { label: crate.name })
  const roi =
    crate.expectedValue === null || crate.openCost === null || crate.openCost === 0
      ? null
      : crate.expectedValue / crate.openCost

  return (
    <>
      <JsonLd data={buildCrateJsonLd(crate)} />
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="relative flex flex-col gap-5 overflow-hidden rounded-surface border border-border bg-surface p-5 sm:flex-row sm:items-center sm:p-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-20 size-72 rounded-full bg-rarity-gold/15 blur-3xl"
          />
          {crate.image === null ? null : (
            <Image
              src={crate.image}
              alt={crate.name}
              width={256}
              height={192}
              loading="eager"
              fetchPriority="high"
              className="relative h-40 w-auto shrink-0 object-contain drop-shadow-xl sm:h-48"
            />
          )}
          <div className="relative flex min-w-0 flex-col gap-2">
            <span className="text-overline uppercase text-subtle-foreground">
              Оружейный кейс
              {crate.releasedAt === null ? null : ` · вышел ${released.format(crate.releasedAt)}`}
            </span>
            <Heading level={1} size="title" className="break-words">
              {crate.name}
            </Heading>
            <Text size="caption" tone="muted" className="max-w-content">
              {crate.itemCount} скинов и редкий особый предмет
              {crate.rareLabel === null ? "" : ` — ${crate.rareLabel}`}. Ниже — все
              предметы по редкостям с шансами выпадения и примерной ценой каждого.
            </Text>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-surface border border-border bg-surface p-5">
            <dl className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <dt className="text-overline uppercase text-subtle-foreground">Кейс</dt>
                <dd className="text-subheading font-bold tabular-nums">{formatUsd(crate.price)}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-overline uppercase text-subtle-foreground">С ключом</dt>
                <dd className="text-subheading font-bold tabular-nums">{formatUsd(crate.openCost)}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-overline uppercase text-subtle-foreground">Средний дроп</dt>
                <dd className="text-subheading font-bold tabular-nums">
                  {formatUsd(crate.expectedValue)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-overline uppercase text-subtle-foreground">Окупаемость</dt>
                <dd
                  className={cn(
                    "text-subheading font-bold tabular-nums",
                    roi === null ? "text-foreground" : roi >= 1 ? "text-success" : "text-danger",
                  )}
                >
                  {roi === null ? "—" : `${Math.round(roi * 100)}%`}
                </dd>
              </div>
            </dl>

            <a
              href={marketUrl("skinport", crate.name, crate.itemPage ?? undefined)}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className={buttonClassName({ size: "lg", fullWidth: true })}
            >
              <ShoppingCart aria-hidden="true" className="size-4" />
              Купить кейс дешевле
            </a>
            <p className="text-caption leading-snug text-subtle-foreground">
              Оценка по медианным ценам Skinport без учёта StatTrak™ и износа; ключ — {formatUsd(KEY_PRICE)}.
              Не является финансовым советом. {AFFILIATE_DISCLOSURE}
            </p>
          </div>

          <AdSlot slot="sidebar" />
        </aside>
      </div>

      {crate.groups.map((group) => {
        const tone = groupTone(group)
        const rare = group.rarity === "rare"

        return (
          <section key={group.rarity} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className={cn("flex items-center gap-2 text-subheading font-semibold", tone.text)}>
                <span aria-hidden="true" className={cn("h-4 w-1 rounded-full", tone.bar)} />
                {rare ? RARE_LABEL : RARITY_LABEL[group.rarity === "rare" ? "covert" : group.rarity]}
              </h2>
              <span className="text-caption text-subtle-foreground">
                шанс <span className="font-semibold tabular-nums text-foreground">{percent(group.chance)}</span>
                {group.averagePrice === null ? null : (
                  <>
                    {" · "}в среднем{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatUsd(group.averagePrice)}
                    </span>
                  </>
                )}
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {group.items.map((item) => (
                <li key={item.id}>
                  <ItemTile item={item} rare={rare} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <section className="flex flex-col gap-2">
        <SectionHeading title="Как считаются шансы" />
        <Text size="caption" tone="muted" className="max-w-content">
          Valve раскрыла вероятности для всех оружейных кейсов: армейское качество — 79,92%,
          запрещённое — 15,98%, засекреченное — 3,2%, тайное — 0,64%, нож или перчатки — 0,26%.
          Внутри одной редкости все предметы выпадают с равным шансом, а StatTrak™-версия — в 10%
          случаев.
        </Text>
      </section>
    </>
  )
}

function CaseSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton variant="text" className="h-3 w-full max-w-72" />
      <Skeleton variant="block" className="h-64 w-full" />
      <Skeleton variant="block" className="h-96 w-full" />
    </div>
  )
}
