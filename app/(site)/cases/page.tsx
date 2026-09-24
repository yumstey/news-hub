import { Suspense } from "react"

import { CRATE_ODDS, CrateCard, crateHref, getCrateCatalog } from "@/entities/crate"
import { RARITY_LABEL, rarityTone } from "@/entities/skin"
import { ROUTES, SITE_URL } from "@/shared/config"
import { buildCollectionPageJsonLd } from "@/shared/lib/seo"
import { cn } from "@/shared/lib/style"
import { AdSlot } from "@/shared/ui/ad-slot"
import { Box } from "lucide-react"
import { plural } from "@/shared/lib/text"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { SectionHeading } from "@/shared/ui/section-heading"
import { HeroLinks, HeroStat, SectionHero } from "@/widgets/game-hub"
import { FaqBlock } from "@/widgets/skin-market"
import type { FaqEntry } from "@/widgets/skin-market"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { CASES_DESCRIPTION, CASES_TITLE } from "./_lib/metadata"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Кейсы" })

const ODDS = [
  { key: "milspec", label: RARITY_LABEL.milspec, tone: rarityTone("milspec") },
  { key: "restricted", label: RARITY_LABEL.restricted, tone: rarityTone("restricted") },
  { key: "classified", label: RARITY_LABEL.classified, tone: rarityTone("classified") },
  { key: "covert", label: RARITY_LABEL.covert, tone: rarityTone("covert") },
  { key: "rare", label: "Нож или перчатки", tone: rarityTone("extraordinary", "knives") },
] as const

const FAQ: readonly FaqEntry[] = [
  {
    question: "Какой шанс выбить нож из кейса CS2?",
    answer:
      "0,26% — примерно один нож или пара перчаток на 385 открытий. Это официальные шансы, которые Valve раскрыла для всех оружейных кейсов.",
  },
  {
    question: "Сколько стоит открыть кейс?",
    answer:
      "Цена кейса на маркете плюс ключ за $2,49 в магазине Steam. На странице каждого кейса мы складываем обе суммы и сравниваем с ожидаемой стоимостью дропа.",
  },
  {
    question: "Окупается ли открытие кейсов?",
    answer:
      "В среднем нет: ожидаемая стоимость выпавшего предмета почти всегда ниже цены кейса с ключом. Если нужен конкретный скин, дешевле купить его напрямую.",
  },
]

const HERO_LINKS = [
  { label: "Скины", href: ROUTES.skins },
  { label: "Обновления", href: ROUTES.updates },
  { label: "Об игре", href: ROUTES.game },
] as const

async function HeroStats() {
  const result = await getCrateCatalog()

  if (!result.ok) return null

  return (
    <HeroStat
      icon={<Box aria-hidden="true" className="size-4 text-subtle-foreground" />}
      value={result.data.length}
      label={plural(result.data.length, ["кейс", "кейса", "кейсов"])}
    />
  )
}

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />

      <SectionHero
        scene="cases"
        crumbs={<Breadcrumbs items={CRUMBS} />}
        title={CASES_TITLE}
        description={CASES_DESCRIPTION}
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
            <section className="flex flex-col gap-3 rounded-surface border border-border bg-surface p-5">
              <SectionHeading title="Шансы выпадения из любого кейса" level={2} />
              <svg viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true" className="h-3 w-full overflow-hidden rounded-full">
                {ODDS.reduce<{ x: number; nodes: React.ReactNode[] }>(
                  (acc, entry) => {
                    const width = Math.max(CRATE_ODDS[entry.key] * 100, 0.8)

                    acc.nodes.push(
                      <rect key={entry.key} x={acc.x} y="0" width={width} height="6" className={entry.tone.fill} />,
                    )

                    return { x: acc.x + width, nodes: acc.nodes }
                  },
                  { x: 0, nodes: [] },
                ).nodes}
              </svg>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {ODDS.map((entry) => (
                  <li key={entry.key} className="flex flex-col gap-0.5 rounded-control bg-muted px-3 py-2">
                    <span className={cn("text-subheading font-bold tabular-nums", entry.tone.text)}>
                      {(CRATE_ODDS[entry.key] * 100).toLocaleString("ru-RU", { maximumFractionDigits: 2 })}%
                    </span>
                    <span className="text-overline uppercase text-subtle-foreground">{entry.label}</span>
                  </li>
                ))}
              </ul>
            </section>

            <Suspense fallback={<div className="h-96 rounded-surface bg-skeleton" />}>
              <Catalog />
            </Suspense>

            <AdSlot slot="inline" />

            <FaqBlock title="Кейсы CS2: частые вопросы" entries={FAQ} />
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function Catalog() {
  const result = await getCrateCatalog()

  if (!result.ok) {
    return <EmptyState tone="danger" title="Кейсы недоступны" description={result.error.message} />
  }

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          name: CASES_TITLE,
          description: CASES_DESCRIPTION,
          url: new URL(ROUTES.cases, SITE_URL).toString(),
          items: result.data.map((crate) => ({
            name: crate.name,
            url: new URL(crateHref(crate.slug), SITE_URL).toString(),
          })),
        })}
      />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {result.data.map((crate, index) => (
          <li key={crate.id}>
            <CrateCard crate={crate} eager={index < 5} />
          </li>
        ))}
      </ul>
    </>
  )
}
