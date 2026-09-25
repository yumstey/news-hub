import type { Match } from "@/entities/match"
import type { FreePhoto, Player } from "@/entities/player"
import { preferPhoto } from "@/entities/player"
import type { RosterMember } from "@/entities/team"
import type { PlayerPath } from "@/shared/config"
import { playerHref } from "@/entities/player"
import { toCountry } from "@/shared/model"
import type { Country } from "@/shared/model"

export type RosterCard = {
  nickname: string
  realName: string | null
  country: Country | null
  role: string | null
  igl: boolean
  joinedAt: Date | null
  href: PlayerPath | null
  photo: { url: string; credit: FreePhoto | null } | null
}

function key(value: string): string {
  return value.toLowerCase()
}

/**
 * Состав собирается по данным Liquipedia: там трансферы правят в тот же день,
 * а в матчевом API ростеры отстают на месяцы. PandaScore остаётся источником
 * фотографий и ссылок на профиль, Commons — запасным источником фото.
 */
export function buildRoster(
  members: readonly RosterMember[],
  players: readonly Player[],
  photos: Readonly<Record<string, FreePhoto>>,
): RosterCard[] {
  const byNickname = new Map(players.map((player) => [key(player.nickname), player]))

  if (members.length === 0) {
    return players.slice(0, 5).map((player) => ({
      nickname: player.nickname,
      realName: player.realName,
      country: toCountry(player.country?.code ?? null),
      role: null,
      igl: false,
      joinedAt: null,
      href: playerHref(player.slug),
      photo: preferPhoto(player.photo?.url ?? null, photos[key(player.nickname)]),
    }))
  }

  return members
    .filter((member) => member.role === null)
    .slice(0, 5)
    .map((member) => {
      const player = byNickname.get(key(member.nickname))
      const joined = member.joinedAt === null ? Number.NaN : Date.parse(member.joinedAt)

      return {
        nickname: player?.nickname ?? member.nickname,
        realName: member.realName ?? player?.realName ?? null,
        country: toCountry(member.countryCode ?? player?.country?.code ?? null),
        role: member.role,
        igl: member.igl,
        joinedAt: Number.isFinite(joined) ? new Date(joined) : null,
        href: player === undefined ? null : playerHref(player.slug),
        photo: preferPhoto(player?.photo?.url ?? null, photos[key(member.nickname)]),
      }
    })
}

/** Ники состава — по ним ищутся свободные фотографии на Commons. */
export function rosterNicknames(
  members: readonly RosterMember[],
  players: readonly Player[],
): string[] {
  const fromWiki = members.filter((member) => member.role === null).map((member) => member.nickname)

  return fromWiki.length > 0 ? fromWiki : players.map((player) => player.nickname)
}

/** Игроки PandaScore, оставшиеся в актуальном составе: для среднего возраста и ссылок. */
export function rosterPlayers(players: readonly Player[], roster: readonly RosterCard[]): Player[] {
  const active = new Set(roster.map((member) => key(member.nickname)))

  return players.filter((player) => active.has(key(player.nickname)))
}

/** Последние исходы команды для полосы формы: победа или поражение. */
export function teamForm(matches: readonly Match[], teamId: string): ("win" | "loss")[] {
  return matches.flatMap((match) => {
    const side = match.teams.find((entry) => entry.team.id === teamId)
    const rival = match.teams.find((entry) => entry.team.id !== teamId)

    if (side === undefined || rival === undefined) return []
    if (!side.isWinner && !rival.isWinner) return []

    return [side.isWinner ? ("win" as const) : ("loss" as const)]
  })
}
