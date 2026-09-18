import type {
  BracketFeedKind,
  BracketMatch,
  BracketSeat,
  BracketSide,
  TournamentBracket,
} from "@/entities/tournament"
import type { MatchPath } from "@/shared/config"

type TeamId = NonNullable<BracketSeat["team"]>["id"]

const SIDE_LABEL: Record<BracketSide, string> = {
  upper: "Верхняя сетка",
  lower: "Нижняя сетка",
  final: "Гранд-финал",
}

export const CARD_WIDTH = 212
export const CARD_HEIGHT = 84

const COLUMN_GAP = 48
const ROW_GAP = 14
const ROUND_LABEL_HEIGHT = 24
const SIDE_LABEL_HEIGHT = 28
const SIDE_GAP = 36
const CORNER = 10
/** Линии проигравших уходят чуть левее, чтобы не ложиться на линии победителей. */
const DROP_OFFSET = 12

export const COLUMN_WIDTH = CARD_WIDTH + COLUMN_GAP

const SLOT = CARD_HEIGHT + ROW_GAP

export type BracketNode = {
  match: BracketMatch
  href: MatchPath
  x: number
  y: number
  teamIds: TeamId[]
}

export type BracketEdge = {
  id: string
  kind: BracketFeedKind
  /** Команда, которая прошла по этой линии; null — пока не сыграно. */
  teamId: TeamId | null
  path: string
}

export type BracketLabel = {
  key: string
  text: string
  x: number
  y: number
}

export type BracketLayout = {
  width: number
  height: number
  nodes: BracketNode[]
  edges: BracketEdge[]
  rounds: BracketLabel[]
  sides: BracketLabel[]
}

type Placement = { id: string; x: number; y: number }

function teamIdsOf(match: BracketMatch): TeamId[] {
  return match.seats
    .map((seat) => seat.team?.id)
    .filter((id): id is TeamId => id !== undefined)
}

function outcomeOf(match: BracketMatch, kind: BracketFeedKind): TeamId | null {
  if (match.status !== "finished") return null

  const [first, second] = match.seats
  const winner = first.isWinner ? first : second.isWinner ? second : null

  if (winner === null) return null

  const seat = kind === "winner" ? winner : winner === first ? second : first

  return seat.team?.id ?? null
}

/** Ортогональная линия со скруглёнными углами: вправо, вниз/вверх, снова вправо. */
function elbow(x1: number, y1: number, x2: number, y2: number, midX: number): string {
  if (Math.abs(y2 - y1) < 1) return `M ${x1} ${y1} H ${x2}`

  const direction = y2 > y1 ? 1 : -1
  const radius = Math.min(CORNER, Math.abs(y2 - y1) / 2, Math.abs(midX - x1), Math.abs(x2 - midX))

  if (radius < 1) return `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`

  return [
    `M ${x1} ${y1}`,
    `H ${midX - radius}`,
    `Q ${midX} ${y1} ${midX} ${y1 + direction * radius}`,
    `V ${y2 - direction * radius}`,
    `Q ${midX} ${y2} ${midX + radius} ${y2}`,
    `H ${x2}`,
  ].join(" ")
}

/**
 * Раскладывает матчи стадии в единую систему координат: колонка = раунд,
 * поэтому верхняя и нижняя сетки стоят на одних вертикалях, а гранд-финал
 * центрируется между ними.
 */
export function layoutBracket(
  bracket: TournamentBracket,
  hrefOf: (matchId: string) => MatchPath,
): BracketLayout {
  const columns = [...new Set(bracket.matches.map((match) => match.column))].sort(
    (left, right) => left - right,
  )
  const columnIndex = new Map(columns.map((column, index) => [column, index]))
  const xOf = (column: number) => (columnIndex.get(column) ?? 0) * COLUMN_WIDTH

  const placements = new Map<string, Placement>()
  const rounds: BracketLabel[] = []
  const sides: BracketLabel[] = []
  const stacked = bracket.sides.filter((side) => side !== "final")
  const showSideLabels = stacked.length > 1

  let cursor = 0
  let firstTop: number | null = null
  let lastBottom = 0

  for (const side of stacked) {
    const members = bracket.matches.filter((match) => match.side === side)

    if (members.length === 0) continue

    const inSide = new Set(members.map((match) => match.id))

    if (showSideLabels) {
      sides.push({ key: side, text: SIDE_LABEL[side], x: 0, y: cursor })
      cursor += SIDE_LABEL_HEIGHT
    }

    const top = cursor + ROUND_LABEL_HEIGHT
    let bottom = top

    for (const column of columns) {
      const inColumn = members.filter((match) => match.column === column)

      if (inColumn.length === 0) continue

      rounds.push({
        key: `${side}-${column}`,
        text: inColumn[0]?.round ?? "",
        x: xOf(column),
        y: cursor,
      })

      const ordered = inColumn
        .map((match, index) => {
          const parents = match.feeds
            .filter((feed) => inSide.has(feed.fromId))
            .map((feed) => placements.get(feed.fromId)?.y)
            .filter((value): value is number => value !== undefined)

          const anchor =
            parents.length === 0
              ? top + index * SLOT
              : parents.reduce((sum, value) => sum + value, 0) / parents.length

          return { match, anchor, index }
        })
        .sort((left, right) => left.anchor - right.anchor || left.index - right.index)

      let limit = top

      for (const entry of ordered) {
        const y = Math.max(entry.anchor, limit)

        placements.set(entry.match.id, { id: entry.match.id, x: xOf(column), y })
        limit = y + SLOT
        bottom = Math.max(bottom, y + CARD_HEIGHT)
      }
    }

    if (firstTop === null) firstTop = top

    lastBottom = bottom
    cursor = bottom + SIDE_GAP
  }

  // Гранд-финал стоит отдельной колонкой по центру между сетками.
  const finals = bracket.matches.filter((match) => match.side === "final")

  for (const [index, match] of finals.entries()) {
    const center = ((firstTop ?? 0) + lastBottom) / 2
    const y = center - CARD_HEIGHT / 2 + index * SLOT

    placements.set(match.id, { id: match.id, x: xOf(match.column), y })
    rounds.push({
      key: `final-${match.id}`,
      text: match.round,
      x: xOf(match.column),
      y: y - ROUND_LABEL_HEIGHT,
    })
  }

  const nodes: BracketNode[] = bracket.matches.flatMap((match) => {
    const placement = placements.get(match.id)

    if (placement === undefined) return []

    return [
      {
        match,
        href: hrefOf(match.id),
        x: placement.x,
        y: placement.y,
        teamIds: teamIdsOf(match),
      },
    ]
  })

  const byId = new Map(nodes.map((node) => [node.match.id, node]))
  const edges: BracketEdge[] = []

  for (const node of nodes) {
    for (const feed of node.match.feeds) {
      const parent = byId.get(feed.fromId)

      if (parent === undefined) continue

      const x1 = parent.x + CARD_WIDTH
      const y1 = parent.y + CARD_HEIGHT / 2
      const x2 = node.x
      const y2 = node.y + CARD_HEIGHT / 2

      if (x2 <= x1) continue

      const midX = x1 + (x2 - x1) / 2 - (feed.kind === "loser" ? DROP_OFFSET : 0)

      edges.push({
        id: `${feed.fromId}-${node.match.id}-${feed.kind}`,
        kind: feed.kind,
        teamId: outcomeOf(parent.match, feed.kind),
        path: elbow(x1, y1, x2, y2, midX),
      })
    }
  }

  const width = columns.length * COLUMN_WIDTH - COLUMN_GAP
  const height = Math.max(
    lastBottom,
    ...nodes.map((node) => node.y + CARD_HEIGHT),
  )

  return { width, height, nodes, edges, rounds, sides }
}
