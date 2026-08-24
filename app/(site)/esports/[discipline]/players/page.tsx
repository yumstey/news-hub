import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

import { getPlayers, PLAYER_ROLE_LABEL, PlayerIdentity } from "@/entities/player"
import { teamHref } from "@/entities/team"
import { cn } from "@/shared/lib/style"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { Container, Section, Stack } from "@/shared/ui/container"
import { EmptyState } from "@/shared/ui/empty-state"
import { JsonLd } from "@/shared/ui/json-ld"
import { Heading, Text } from "@/shared/ui/typography"
import { DisciplineHeaderSkeleton } from "@/widgets/discipline-header"

import { breadcrumbsJsonLd, disciplineBreadcrumbs } from "../_lib/breadcrumbs"
import { DisciplineHeaderSection } from "../_lib/DisciplineHeaderSection"
import { resolveDiscipline } from "../_lib/discipline"
import type { DisciplineParams } from "../_lib/discipline"
import { sectionMetadata } from "../_lib/metadata"

type PlayersProps = PageProps<"/esports/[discipline]/players">

export function generateMetadata(props: PlayersProps) {
  return sectionMetadata(
    props.params,
    "players",
    (discipline) => `Игроки ${discipline.shortTitle}`,
    (discipline) =>
      `Игроки ${discipline.title}: рейтинг, K/D, урон за раунд, роль в команде и количество сыгранных карт.`,
  )
}

export default function Page(props: PlayersProps) {
  return (
    <>
      <Suspense fallback={<DisciplineHeaderSkeleton />}>
        <DisciplineHeaderSection params={props.params} section="players" />
      </Suspense>

      <Container>
        <Section spacing="md">
          <Stack gap="lg">
            <Suspense fallback={<PlayersTableSkeleton />}>
              <PlayersContent params={props.params} />
            </Suspense>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

function ratingTone(rating: number): string {
  if (rating >= 1.15) return "text-success"
  if (rating < 0.95) return "text-danger"
  return "text-foreground"
}

async function PlayersContent({ params }: { params: DisciplineParams }) {
  const discipline = await resolveDiscipline(params)
  const crumbs = disciplineBreadcrumbs(discipline.slug, discipline.title, [{ label: "Игроки" }])
  const result = await getPlayers(discipline.slug, "rating")

  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />

      <Stack gap="sm">
        <Heading level={1} size="title">
          Игроки {discipline.shortTitle}
        </Heading>
        <Text size="caption" tone="muted" className="max-w-content">
          Список отсортирован по рейтингу за последние двенадцать месяцев. Учитываются только
          матчи в официальных турнирах.
        </Text>
      </Stack>

      {!result.ok ? (
        <EmptyState tone="danger" title="Игроки недоступны" description={result.error.message} />
      ) : result.data.length === 0 ? (
        <EmptyState title="Игроков пока нет" />
      ) : (
        <div className="overflow-x-auto rounded-surface border border-border bg-surface">
          <table className="w-full min-w-180 border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-overline uppercase text-subtle-foreground">
                <th scope="col" className="w-12 py-3 pl-4 text-left font-semibold">
                  #
                </th>
                <th scope="col" className="py-3 text-left font-semibold">
                  Игрок
                </th>
                <th scope="col" className="px-3 py-3 text-left font-semibold">
                  Команда
                </th>
                <th scope="col" className="px-3 py-3 text-left font-semibold">
                  Роль
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  K/D
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  ADR
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Карты
                </th>
                <th scope="col" className="py-3 pr-4 text-right font-semibold">
                  Рейтинг
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((player, index) => (
                <tr key={player.id} className="border-b border-border last:border-0">
                  <td className="py-3 pl-4 text-caption tabular-nums text-subtle-foreground">
                    {index + 1}
                  </td>
                  <td className="py-3">
                    <PlayerIdentity
                      disciplineSlug={discipline.slug}
                      slug={player.slug}
                      nickname={player.nickname}
                      photo={player.photo}
                      country={player.country}
                    />
                  </td>
                  <td className="px-3 py-3">
                    {player.team ? (
                      <Link
                        href={teamHref(discipline.slug, player.team.slug)}
                        className="inline-flex items-center gap-2 text-caption text-muted-foreground transition-colors duration-150 hover:text-foreground"
                      >
                        <Image
                          src={player.team.logo.url}
                          alt={player.team.logo.alt}
                          width={20}
                          height={20}
                          className="size-5 rounded-xs object-contain"
                        />
                        <span className="truncate">{player.team.shortName}</span>
                      </Link>
                    ) : (
                      <span className="text-caption text-subtle-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-caption text-muted-foreground">
                    {PLAYER_ROLE_LABEL[player.role]}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                    {player.stats.kd.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                    {player.stats.adr.toFixed(1)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                    {player.stats.mapsPlayed}
                  </td>
                  <td
                    className={cn(
                      "py-3 pr-4 text-right font-bold tabular-nums",
                      ratingTone(player.stats.rating),
                    )}
                  >
                    {player.stats.rating.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function PlayersTableSkeleton() {
  const items = Array.from({ length: 10 }, (_, index) => index)

  return (
    <div className="flex flex-col gap-2 rounded-surface border border-border bg-surface p-4">
      {items.map((item) => (
        <div key={item} className="h-10 rounded-sm bg-skeleton" />
      ))}
    </div>
  )
}
