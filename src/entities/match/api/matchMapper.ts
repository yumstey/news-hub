import type { Match, MatchWire } from "../model/match"

export function toMatch(wire: MatchWire): Match {
  const [first, second] = wire.teams

  return {
    id: wire.id,
    discipline: wire.discipline,
    tournament: wire.tournament,
    stage: wire.stage,
    bracket:
      wire.bracket === null
        ? null
        : {
            round: wire.bracket.round,
            roundTitle: wire.bracket.round_title,
            position: wire.bracket.position,
          },
    status: wire.status,
    format: wire.format,
    startsAt: new Date(wire.starts_at),
    teams: [
      { team: first.team, score: first.score, isWinner: first.is_winner },
      { team: second.team, score: second.score, isWinner: second.is_winner },
    ],
    score:
      wire.status === "scheduled" || wire.status === "cancelled"
        ? null
        : { side1: first.score, side2: second.score },
    maps: wire.maps.map((entry) => ({
      name: entry.name,
      side1Score: entry.side1_score,
      side2Score: entry.side2_score,
      status: entry.status,
      pick: entry.pick,
    })),
    streams: wire.streams,
    lineups: [wire.lineups[0], wire.lineups[1]],
    statistics:
      wire.statistics === null
        ? null
        : [
            wire.statistics[0].map((row) => ({ ...row })),
            wire.statistics[1].map((row) => ({ ...row })),
          ],
  }
}
