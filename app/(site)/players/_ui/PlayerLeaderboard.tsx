import Link from "next/link"

import { getPlayerLeaderboard, getPlayers, playerHref } from "@/entities/player"
import { cn } from "@/shared/lib/style"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"

const LIMIT = 20

function Value({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <td
      className={cn(
        "py-2.5 text-right tabular-nums",
        strong ? "font-bold text-foreground" : "text-muted-foreground",
      )}
    >
      {children}
    </td>
  )
}

/**
 * Таблица лучших игроков по рейтингу bo3.gg: карьерный рейтинг, форма за
 * полгода, K/D и урон. Ссылка ведёт на профиль, если игрок есть в нашей базе.
 */
export async function PlayerLeaderboard() {
  const [board, players] = await Promise.all([getPlayerLeaderboard(LIMIT), getPlayers()])

  if (!board.ok || board.data.length === 0) return null

  const known = new Map(
    (players.ok ? players.data : []).map((player) => [player.nickname.toLowerCase(), player.slug]),
  )

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading title="Рейтинг игроков" />

      <div className="overflow-x-auto rounded-surface border border-border bg-surface">
        <table className="w-full min-w-160 border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-overline uppercase text-subtle-foreground">
              <th scope="col" className="w-12 py-3 pl-4 text-left font-semibold">
                #
              </th>
              <th scope="col" className="py-3 text-left font-semibold">
                Игрок
              </th>
              <th scope="col" className="py-3 text-left font-semibold">
                Команда
              </th>
              <th scope="col" className="py-3 text-right font-semibold">
                Рейтинг
              </th>
              <th scope="col" className="py-3 text-right font-semibold">
                Форма
              </th>
              <th scope="col" className="py-3 text-right font-semibold">
                K/D
              </th>
              <th scope="col" className="py-3 text-right font-semibold">
                Урон
              </th>
              <th scope="col" className="py-3 pr-4 text-right font-semibold">
                Карт
              </th>
            </tr>
          </thead>
          <tbody>
            {board.data.map((row) => {
              const slug = known.get(row.nickname.toLowerCase())

              return (
                <tr key={row.slug} className="border-b border-border last:border-0 hover:bg-muted/60">
                  <td className="py-2.5 pl-4">
                    <span
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        row.position <= 3 ? "text-primary" : "text-subtle-foreground",
                      )}
                    >
                      {row.position}
                    </span>
                  </td>
                  <td className="py-2.5 font-semibold text-foreground">
                    {slug === undefined ? (
                      row.nickname
                    ) : (
                      <Link
                        href={playerHref(slug)}
                        className="transition-colors duration-150 hover:text-primary"
                      >
                        {row.nickname}
                      </Link>
                    )}
                  </td>
                  <td className="py-2.5 text-caption text-muted-foreground">{row.team ?? "—"}</td>
                  <Value strong>{row.rating.toFixed(2)}</Value>
                  <Value>
                    {row.recentRating === null ? (
                      "—"
                    ) : (
                      <span
                        className={cn(
                          row.recentRating > row.rating ? "text-success" : "text-muted-foreground",
                        )}
                      >
                        {row.recentRating.toFixed(2)}
                      </span>
                    )}
                  </Value>
                  <Value>{row.kd.toFixed(2)}</Value>
                  <Value>{row.adr.toFixed(1)}</Value>
                  <td className="py-2.5 pr-4 text-right tabular-nums text-subtle-foreground">
                    {row.games}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Text size="caption" tone="subtle">
        Рейтинг и статистика —{" "}
        <a
          href="https://bo3.gg"
          target="_blank"
          rel="noopener noreferrer external"
          className="text-primary underline-offset-2 hover:underline"
        >
          bo3.gg
        </a>
        . В таблицу попадают игроки минимум с 250 сыгранными картами; «форма» — средний рейтинг за
        последние полгода.
      </Text>
    </section>
  )
}

export function PlayerLeaderboardSkeleton() {
  return <div className="h-96 w-full rounded-surface border border-border bg-skeleton" />
}
