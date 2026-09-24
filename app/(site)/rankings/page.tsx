import { Suspense } from "react"

import { getRankingBoard, VALVE_REGIONS } from "@/entities/team"
import type { ValveRegion } from "@/entities/team"
import { ROUTES, SITE_URL } from "@/shared/config"
import { formatDate } from "@/shared/lib/date"
import { AdSlot } from "@/shared/ui/ad-slot"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"
import { HeroLinks, HeroStat, SectionHero } from "@/widgets/game-hub"
import {
  RankingMovers,
  RankingMoversSkeleton,
  RankingSection,
  RankingSectionSkeleton,
} from "@/widgets/team-rankings"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { RANKINGS_DESCRIPTION, RANKINGS_TITLE } from "./_lib/metadata"

export { generateMetadata } from "./_lib/metadata"

const CRUMBS = trail({ label: "Рейтинг" })

const HERO_LINKS = [
  { label: "Команды", href: ROUTES.teams },
  { label: "Матчи", href: ROUTES.matches },
  { label: "Результаты", href: ROUTES.results },
] as const

/** Из чего Valve складывает очки: объяснение под таблицей отвечает на «почему так». */
const FACTORS = [
  {
    title: "Ценность скальпа",
    text: "Насколько ценна победа над этой командой для соперников: чем выше рейтинг команды, тем дороже стоит её обыграть.",
  },
  {
    title: "Победы над сильными",
    text: "Сколько «дорогих» побед команда собрала сама — учитываются только выигранные матчи против рейтинговых соперников.",
  },
  {
    title: "Сеть соперников",
    text: "Насколько разнообразен календарь: победы над одним и тем же клубом дают меньше, чем игры с разными соперниками.",
  },
  {
    title: "Победы на LAN",
    text: "Офлайн-матчи весят больше онлайновых: Valve отдельно считает выигрыши на площадке.",
  },
]

async function HeroStats({ region }: { region: ValveRegion }) {
  const result = await getRankingBoard(region, 0, 1)

  if (!result.ok) return null

  const leader = result.data.rows[0]

  return (
    <>
      <HeroStat value={result.data.total} label="команд в рейтинге" />
      {leader === undefined ? null : (
        <HeroStat value={leader.team?.name ?? leader.name} label="первое место" />
      )}
      {result.data.updatedAt === null ? null : (
        <HeroStat value={formatDate(result.data.updatedAt)} label="снимок Valve" />
      )}
    </>
  )
}

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Как считается рейтинг команд CS2?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Valve публикует Regional Standings — открытый рейтинг, который складывается из четырёх факторов: ${FACTORS.map((factor) => factor.title.toLowerCase()).join(", ")}. Итоговые очки и разбор по каждой команде выкладываются в официальном репозитории и обновляются примерно раз в месяц.`,
        },
      },
      {
        "@type": "Question",
        name: "Чем рейтинг Valve отличается от рейтинга HLTV?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Рейтинг Valve — официальный: по нему распределяются приглашения на мейджоры и отборочные. Он считается по открытой формуле, а исходные данные и разбор очков каждой команды публикуются в репозитории Valve.",
        },
      },
    ],
  }
}

function itemListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: RANKINGS_TITLE,
    url: `${SITE_URL}${ROUTES.rankings}`,
  }
}

export default function Page(props: PageProps<"/rankings">) {
  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />
      <JsonLd data={faqJsonLd()} />
      <JsonLd data={itemListJsonLd()} />

      <SectionHero
        scene="rankings"
        crumbs={<Breadcrumbs items={CRUMBS} />}
        title={RANKINGS_TITLE}
        description={
          <>
            {RANKINGS_DESCRIPTION} Официальный рейтинг Valve: очки, состав и разбор по каждой
            команде.
          </>
        }
        stats={
          <Suspense fallback={null}>
            <HeroStats region="global" />
          </Suspense>
        }
        actions={<HeroLinks links={HERO_LINKS} />}
      />

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<RankingMoversSkeleton />}>
              <RankingMovers />
            </Suspense>

            <Suspense fallback={<RankingSectionSkeleton />}>
              <Board searchParams={props.searchParams} />
            </Suspense>

            <AdSlot slot="inline" />

            <section className="flex flex-col gap-4">
              <SectionHeading title="Как считается рейтинг" />
              <div className="grid gap-3 sm:grid-cols-2">
                {FACTORS.map((factor) => (
                  <article
                    key={factor.title}
                    className="flex flex-col gap-1.5 rounded-surface border border-border bg-surface p-4"
                  >
                    <h3 className="text-caption font-bold text-foreground">{factor.title}</h3>
                    <p className="text-caption leading-relaxed text-muted-foreground">{factor.text}</p>
                  </article>
                ))}
              </div>
              <Text size="caption" tone="subtle">
                Данные рейтинга — открытый репозиторий Valve Regional Standings. Обновляется
                примерно раз в месяц; по нему распределяются приглашения на мейджоры.
              </Text>
            </section>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function Board({ searchParams }: Pick<PageProps<"/rankings">, "searchParams">) {
  const { region } = await searchParams
  const active = VALVE_REGIONS.find((entry) => entry === region) ?? "global"

  return <RankingSection region={active} />
}
