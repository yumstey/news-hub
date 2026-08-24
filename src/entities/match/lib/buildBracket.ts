import type { Match, MatchSide } from "../model/match"

export type BracketSlot =
  | { kind: "match"; match: Match }
  | { kind: "pending"; position: number }

export type BracketRound = {
  round: number
  title: string
  slots: BracketSlot[]
}

function expectedSize(firstRoundSize: number, roundIndex: number): number {
  return Math.max(1, Math.round(firstRoundSize / 2 ** roundIndex))
}

export function buildBracket(matches: readonly Match[]): BracketRound[] {
  const seeded = matches.filter((match) => match.bracket !== null)

  if (seeded.length === 0) return []

  const grouped = new Map<number, { title: string; matches: Match[] }>()

  for (const match of seeded) {
    if (match.bracket === null) continue

    const existing = grouped.get(match.bracket.round)

    if (existing) {
      existing.matches.push(match)
      continue
    }

    grouped.set(match.bracket.round, {
      title: match.bracket.roundTitle,
      matches: [match],
    })
  }

  const rounds = [...grouped.entries()].sort(([left], [right]) => left - right)
  const firstRound = rounds[0]

  if (firstRound === undefined) return []

  const firstRoundSize = firstRound[1].matches.length
  const totalRounds = Math.max(rounds.length, Math.log2(firstRoundSize) + 1)
  const result: BracketRound[] = []

  for (let index = 0; index < totalRounds; index += 1) {
    const entry = rounds[index]
    const size = expectedSize(firstRoundSize, index)
    const ordered = entry
      ? [...entry[1].matches].sort(
          (left, right) => (left.bracket?.position ?? 0) - (right.bracket?.position ?? 0),
        )
      : []

    const slots: BracketSlot[] = []

    for (let position = 1; position <= size; position += 1) {
      const match = ordered.find((item) => item.bracket?.position === position)
      slots.push(match ? { kind: "match", match } : { kind: "pending", position })
    }

    result.push({
      round: index + 1,
      title: entry ? entry[1].title : index + 1 === totalRounds ? "Гранд-финал" : `Раунд ${index + 1}`,
      slots,
    })
  }

  return result
}

export function sideLabel(side: MatchSide): string {
  return side.team.shortName
}
