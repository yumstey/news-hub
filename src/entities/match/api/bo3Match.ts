import { cacheTag } from "next/cache"
import { z } from "zod"

import { fetchJson, ok } from "@/shared/api"
import type { ApiResult } from "@/shared/api"
import { matchTag } from "@/shared/config"
import { cacheFor } from "@/shared/lib/cache"

const API = "https://api.bo3.gg/api/v1"
const SITE = "https://bo3.gg/matches"

/** Время начала у PandaScore и bo3.gg расходится на часы, поэтому ищем в окне суток. */
const WINDOW_MS = 24 * 60 * 60 * 1000
/** Через сутки после старта bo3.gg дописала карты — результат уже не изменится. */
const SETTLED_AFTER_MS = 24 * 60 * 60 * 1000
/** Длиннее bo7 матчей не бывает; запас — на строки ещё не сыгранных карт. */
const GAMES_LIMIT = 10
/** Матчей пары в сутках больше одного не ждём, но окно ловит и соседние. */
const MATCHES_LIMIT = 50
const TEAMS_LIMIT = 20

export type Bo3PlayerStat = {
  nickname: string
  teamName: string
  kills: number
  deaths: number
  assists: number
  adr: number
  /** Доля раундов с полезным действием, 0..1. */
  kast: number
  /** Рейтинг bo3.gg по шкале 0–10. */
  rating: number
  headshotShare: number
  firstKills: number
}

export type Bo3MapScore = {
  order: number
  map: string
  /** Счёт первой команды нашего матча (teams[0]). */
  firstScore: number
  secondScore: number
  players: Bo3PlayerStat[]
}

export type Bo3VetoStep = {
  order: number
  action: "pick" | "ban" | "decider"
  map: string | null
  /** Название команды, сделавшей выбор. */
  team: string | null
}

export type Bo3MatchDetail = {
  slug: string
  /** Ссылка на матч на bo3.gg. */
  source: string
  maps: Bo3MapScore[]
  veto: Bo3VetoStep[]
}

const teamsSchema = z.object({
  results: z.array(z.object({ id: z.number().int(), name: z.string() })).catch([]),
})

const matchListSchema = z.object({
  results: z
    .array(
      z.object({
        slug: z.string(),
        team1_id: z.number().int().nullable().catch(null),
        team2_id: z.number().int().nullable().catch(null),
        start_date: z.string().catch(""),
      }),
    )
    .catch([]),
})

/** Карта из справочника bo3.gg: имя для показа и синонимы вроде «de_dust2». */
const mapSchema = z.object({
  name: z.string(),
  slug: z.string().catch(""),
  map_name: z.string().nullable().catch(null),
  alternative_names: z.array(z.string()).catch([]),
})

const matchDetailSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  status: z.string().catch(""),
  match_maps: z
    .array(
      z.object({
        order: z.number().int().catch(0),
        choice_type: z.number().int().catch(0),
        team_id: z.number().int().nullable().catch(null),
        maps: mapSchema.nullable().catch(null),
      }),
    )
    .catch([]),
})

const gamesSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number().int(),
        number: z.number().int().catch(0),
        map_name: z.string().nullable().catch(null),
        winner_clan_name: z.string().nullable().catch(null),
        winner_clan_score: z.number().nullable().catch(null),
        loser_clan_score: z.number().nullable().catch(null),
      }),
    )
    .catch([]),
})

/** Статистика карты приходит голым массивом из десяти строк, без обёртки results. */
const playersStatsSchema = z.array(
  z.object({
    clan_name: z.string().nullable().catch(null),
    win: z.number().int().catch(0),
    kills: z.number().catch(0),
    death: z.number().catch(0),
    assists: z.number().catch(0),
    headshots: z.number().catch(0),
    first_kills: z.number().catch(0),
    kast: z.number().catch(0),
    adr: z.number().catch(0),
    player_rating: z.number().catch(0),
    team_clan: z
      .object({ team_id: z.number().int().nullable().catch(null) })
      .nullable()
      .catch(null),
    steam_profile: z.object({ nickname: z.string().catch("") }).nullable().catch(null),
  }),
)

type Bo3Team = z.infer<typeof teamsSchema>["results"][number]
type PlayerRow = z.infer<typeof playersStatsSchema>[number]
type GameRow = z.infer<typeof gamesSchema>["results"][number]

/**
 * Имена, у которых у PandaScore и bo3.gg нет общей подстроки: подстановкой
 * их не свести, поэтому держим короткий словарь вместо общего правила.
 */
const ALIASES: Record<string, string> = {
  navi: "Natus Vincere",
  mousesports: "MOUZ",
  mouz: "MOUZ",
  vp: "Virtus.pro",
  virtuspro: "Virtus.pro",
  nip: "Ninjas in Pyjamas",
  col: "Complexity",
  c9: "Cloud9",
  g2: "G2",
}

/** Префиксы карт Source: «de_dust2» и «dust2» — одно и то же. */
const MAP_PREFIX = /^(de|cs|ar)_/

/**
 * Ключ для сверки названий. «Academy» и «Junior» намеренно остаются: это
 * отдельные команды, и стирание суффикса склеило бы их с основным составом.
 */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/^(team|the)/, "")
    .replace(/(esports?|gaming|club|team)$/, "")
}

/**
 * Ядро названия для запроса к источнику. PandaScore пишет «Team Spirit» и
 * «MOUZ Esports», bo3.gg — «Spirit» и «MOUZ». Ведущее «The» не трогаем: у
 * «The MongolZ» оно часть имени в обоих источниках.
 */
function core(value: string): string {
  return value
    .replace(/^team\s+/i, "")
    .replace(/\s+(esports?|gaming|club|clan|team)$/i, "")
    .trim()
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Сверка названий команд: bo3.gg пишет «MOUZ», PandaScore — «MOUZ Esports»,
 * а таблица статистики — клан-тег. Короткие токены сравниваем только целиком,
 * иначе «G2» цепляет «G2 Academy».
 */
function alike(left: string, right: string): boolean {
  const a = normalize(left)
  const b = normalize(right)

  if (a.length === 0 || b.length === 0) return false
  if (a === b) return true

  return a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a))
}

function filter(field: string, op: string, value: string): string {
  return `filter${encodeURIComponent(`[${field}][${op}]`)}=${encodeURIComponent(value)}`
}

function limit(value: number): string {
  return `page${encodeURIComponent("[limit]")}=${value}`
}

/**
 * Поиск команды на bo3.gg. Точное имя закрывает большинство случаев, слаг
 * ловит написание PandaScore («mousesports»), подстрока — остаток. Фильтр без
 * префикса таблицы источник молча игнорирует, поэтому он всегда «teams.».
 */
async function resolveTeam(name: string): Promise<{ team: Bo3Team | null; healthy: boolean }> {
  const canonical = ALIASES[normalize(name)] ?? core(name)

  const byName = await fetchJson(
    `${API}/teams?${filter("teams.name", "eq", canonical)}&${limit(TEAMS_LIMIT)}`,
    teamsSchema,
  )

  if (!byName.ok) return { team: null, healthy: false }

  const exact = byName.data.results.find((row) => alike(row.name, canonical)) ?? byName.data.results[0]

  if (exact !== undefined) return { team: exact, healthy: true }

  const bySlug = await fetchJson(
    `${API}/teams?${filter("teams.slug", "eq", slugify(name))}&${limit(TEAMS_LIMIT)}`,
    teamsSchema,
  )

  if (!bySlug.ok) return { team: null, healthy: false }

  const slugHit = bySlug.data.results[0]

  if (slugHit !== undefined) return { team: slugHit, healthy: true }

  const fuzzy = await fetchJson(
    `${API}/teams?${filter("teams.name", "like", canonical)}&${limit(TEAMS_LIMIT)}`,
    teamsSchema,
  )

  if (!fuzzy.ok) return { team: null, healthy: false }

  // Подстрока возвращает и «Spirit», и «Team Spirit Academy White»: полное
  // совпадение ключа важнее, иначе основной состав уступит место молодёжному.
  const key = normalize(canonical)
  const strict = fuzzy.data.results.find((row) => normalize(row.name) === key)

  return {
    team: strict ?? fuzzy.data.results.find((row) => alike(row.name, canonical)) ?? null,
    healthy: true,
  }
}

/** Стороны матча: id на bo3.gg рядом с именами, которые передал вызывающий. */
type Sides = {
  first: Bo3Team
  second: Bo3Team
  firstName: string
  secondName: string
}

/**
 * К какой стороне относится клан. Id надёжнее имени, поэтому пробуем его
 * первым; в таблице игр bo3.gg отдаёт только название клана — там остаётся
 * терпимое сравнение.
 */
function sideOf(sides: Sides, clan: string | null, teamId: number | null): "first" | "second" | null {
  if (teamId !== null) {
    if (teamId === sides.first.id) return "first"
    if (teamId === sides.second.id) return "second"
  }

  if (clan === null) return null
  if (alike(clan, sides.first.name) || alike(clan, sides.firstName)) return "first"
  if (alike(clan, sides.second.name) || alike(clan, sides.secondName)) return "second"

  return null
}

function teamNameOf(sides: Sides, side: "first" | "second" | null, fallback: string): string {
  if (side === "first") return sides.firstName
  if (side === "second") return sides.secondName

  return fallback
}

/** Выбор карты делает одна из сторон матча; решающую карту не выбирает никто. */
function vetoTeam(sides: Sides, teamId: number | null): string | null {
  if (teamId === null) return null

  const side = sideOf(sides, null, teamId)

  return side === null ? null : teamNameOf(sides, side, "")
}

/**
 * Матч пары в окне суток. Порядок команд источник не нормализует, а «или» в
 * фильтрах не поддерживает, поэтому спрашиваем обе позиции первой команды.
 */
async function findSlug(
  sides: Sides,
  startsAt: number,
): Promise<{ slug: string | null; healthy: boolean }> {
  const from = new Date(startsAt - WINDOW_MS).toISOString()
  const to = new Date(startsAt + WINDOW_MS).toISOString()
  const window = [
    filter("matches.start_date", "gt", from),
    filter("matches.start_date", "lt", to),
    limit(MATCHES_LIMIT),
  ].join("&")

  const [asFirst, asSecond] = await Promise.all([
    fetchJson(
      `${API}/matches?${window}&${filter("matches.team1_id", "eq", String(sides.first.id))}`,
      matchListSchema,
    ),
    fetchJson(
      `${API}/matches?${window}&${filter("matches.team2_id", "eq", String(sides.first.id))}`,
      matchListSchema,
    ),
  ])

  if (!asFirst.ok || !asSecond.ok) return { slug: null, healthy: false }

  const rows = [...asFirst.data.results, ...asSecond.data.results].filter(
    (row) => row.team1_id === sides.second.id || row.team2_id === sides.second.id,
  )

  // В окне может оказаться и групповой, и плей-офф той же пары: берём ближний.
  const closest = rows.reduce<{ slug: string; gap: number } | null>((best, row) => {
    const at = Date.parse(row.start_date)
    const gap = Number.isFinite(at) ? Math.abs(at - startsAt) : Number.POSITIVE_INFINITY

    return best === null || gap < best.gap ? { slug: row.slug, gap } : best
  }, null)

  return { slug: closest?.slug ?? null, healthy: true }
}

type MapDictionary = ReadonlyMap<string, string>

/** Справочник карт собирается из вето: там имя для показа лежит рядом с синонимами. */
function mapDictionary(steps: z.infer<typeof matchDetailSchema>["match_maps"]): MapDictionary {
  const dictionary = new Map<string, string>()

  for (const step of steps) {
    if (step.maps === null) continue

    const synonyms = [step.maps.slug, step.maps.map_name, ...step.maps.alternative_names]

    for (const synonym of synonyms) {
      if (synonym === null || synonym.length === 0) continue

      dictionary.set(synonym.toLowerCase().replace(MAP_PREFIX, ""), step.maps.name)
    }
  }

  return dictionary
}

/** Игры отдают техническое «de_dust2»; показываем «Dust2» из справочника вето. */
function mapLabel(raw: string, dictionary: MapDictionary): string {
  const key = raw.toLowerCase().replace(MAP_PREFIX, "")
  const known = dictionary.get(key)

  if (known !== undefined) return known

  const head = key.slice(0, 1)

  return head.length === 0 ? raw : `${head.toUpperCase()}${key.slice(1)}`
}

function vetoAction(choice: number): Bo3VetoStep["action"] {
  if (choice === 1) return "pick"
  if (choice === 2) return "ban"

  return "decider"
}

function toPlayer(sides: Sides, row: PlayerRow): { side: "first" | "second" | null; stat: Bo3PlayerStat } {
  const side = sideOf(sides, row.clan_name, row.team_clan?.team_id ?? null)

  return {
    side,
    stat: {
      nickname: row.steam_profile?.nickname ?? "",
      teamName: teamNameOf(sides, side, row.clan_name ?? ""),
      kills: row.kills,
      deaths: row.death,
      assists: row.assists,
      adr: row.adr,
      kast: row.kast,
      rating: row.player_rating,
      // Источник отдаёт хедшоты штуками, а карточке игрока нужна доля.
      headshotShare: row.kills > 0 ? row.headshots / row.kills : 0,
      firstKills: row.first_kills,
    },
  }
}

/**
 * Победу карты определяем по клану победителя, а если имя не свелось — по
 * флагу win в строке любого игрока первой команды: там есть id команды.
 */
function firstWonMap(sides: Sides, game: GameRow, rows: readonly PlayerRow[]): boolean {
  const byClan = sideOf(sides, game.winner_clan_name, null)

  if (byClan !== null) return byClan === "first"

  const mine = rows.find(
    (row) => sideOf(sides, row.clan_name, row.team_clan?.team_id ?? null) === "first",
  )

  return mine === undefined ? true : mine.win === 1
}

function toMapScore(
  sides: Sides,
  game: GameRow,
  rows: readonly PlayerRow[],
  dictionary: MapDictionary,
): Bo3MapScore {
  const firstWon = firstWonMap(sides, game, rows)
  const winnerScore = game.winner_clan_score ?? 0
  const loserScore = game.loser_clan_score ?? 0
  const players = rows.map((row) => toPlayer(sides, row))

  // Сначала наша первая команда, внутри команды — по рейтингу, как на bo3.gg.
  players.sort((left, right) => {
    if (left.side !== right.side) return left.side === "first" ? -1 : 1

    return right.stat.rating - left.stat.rating
  })

  return {
    order: game.number,
    map: mapLabel(game.map_name ?? "", dictionary),
    firstScore: firstWon ? winnerScore : loserScore,
    secondScore: firstWon ? loserScore : winnerScore,
    players: players.map((entry) => entry.stat),
  }
}

type Loaded = {
  detail: Bo3MatchDetail | null
  healthy: boolean
  settled: boolean
}

async function load(
  firstTeam: string,
  secondTeam: string,
  startsAt: number,
  stale: boolean,
): Promise<Loaded> {
  const [first, second] = await Promise.all([resolveTeam(firstTeam), resolveTeam(secondTeam)])
  const teamsHealthy = first.healthy && second.healthy

  if (first.team === null || second.team === null) {
    return { detail: null, healthy: teamsHealthy, settled: stale }
  }

  const sides: Sides = {
    first: first.team,
    second: second.team,
    firstName: firstTeam,
    secondName: secondTeam,
  }

  const found = await findSlug(sides, startsAt)

  if (found.slug === null) {
    return { detail: null, healthy: teamsHealthy && found.healthy, settled: stale }
  }

  const detail = await fetchJson(
    `${API}/matches/${encodeURIComponent(found.slug)}`,
    matchDetailSchema,
  )

  if (!detail.ok) return { detail: null, healthy: false, settled: stale }

  // defwin — техническая победа: карт не будет, но матч закрыт.
  const settled = detail.data.status === "finished" || detail.data.status === "defwin"
  const dictionary = mapDictionary(detail.data.match_maps)

  const veto = [...detail.data.match_maps]
    .sort((left, right) => left.order - right.order)
    .map((step) => ({
      order: step.order,
      action: vetoAction(step.choice_type),
      map: step.maps?.name ?? null,
      team: vetoTeam(sides, step.team_id),
    }))

  const games = await fetchJson(
    `${API}/games?${filter("games.match_id", "eq", String(detail.data.id))}&${limit(GAMES_LIMIT)}`,
    gamesSchema,
  )

  if (!games.ok) {
    return {
      detail: { slug: detail.data.slug, source: `${SITE}/${detail.data.slug}`, maps: [], veto },
      healthy: false,
      settled,
    }
  }

  // У незапущенных карт номер есть, а результата нет — статистику по ним не просим.
  const played = games.data.results
    .filter((game) => game.map_name !== null && game.winner_clan_score !== null)
    .sort((left, right) => left.number - right.number)

  const stats = await Promise.all(
    played.map((game) => fetchJson(`${API}/games/${game.id}/players_stats`, playersStatsSchema)),
  )

  // Провалившаяся статистика одной карты не должна убирать счёт остальных.
  const maps = played.map((game, index) => {
    const rows = stats[index]

    return toMapScore(sides, game, rows !== undefined && rows.ok ? rows.data : [], dictionary)
  })

  return {
    detail: { slug: detail.data.slug, source: `${SITE}/${detail.data.slug}`, maps, veto },
    healthy: teamsHealthy && found.healthy && stats.every((entry) => entry.ok),
    settled,
  }
}

/**
 * Разбор матча на bo3.gg: счёт по картам, статистика игроков и порядок вето.
 * PandaScore на текущем тарифе отдаёт только номера игр, а матч там опознаётся
 * по названиям команд и времени начала — id между источниками не сходятся.
 * Источник неофициальный, поэтому любой сбой просто убирает блок со страницы.
 */
export async function getBo3MatchDetail(
  firstTeam: string,
  secondTeam: string,
  startsAtIso: string,
): Promise<ApiResult<Bo3MatchDetail | null>> {
  "use cache"
  // Id матча сюда не передаётся, поэтому тег собирается из тех же ключей поиска.
  cacheTag(matchTag(`bo3:${slugify(firstTeam)}-vs-${slugify(secondTeam)}-${startsAtIso}`))

  const startsAt = Date.parse(startsAtIso)
  const stale = Number.isFinite(startsAt) && Date.now() - startsAt > SETTLED_AFTER_MS
  const loaded = Number.isFinite(startsAt)
    ? await load(firstTeam, secondTeam, startsAt, stale)
    : { detail: null, healthy: true, settled: true }

  cacheFor(loaded.settled ? "reference" : "schedule", loaded.healthy)

  return ok(loaded.detail)
}
