import { z } from "zod"

import { playerRefSchema } from "@/entities/player/@x/match"
import type { PlayerRef } from "@/entities/player/@x/match"
import { teamRefSchema } from "@/entities/team/@x/match"
import type { TeamRef } from "@/entities/team/@x/match"
import { tournamentRefSchema } from "@/entities/tournament/@x/match"
import type { TournamentRef } from "@/entities/tournament/@x/match"

export const matchIdSchema = z.string().min(1).brand<"MatchId">()
export type MatchId = z.infer<typeof matchIdSchema>

export const matchStatusSchema = z.enum(["scheduled", "live", "finished", "cancelled"])
export type MatchStatus = z.infer<typeof matchStatusSchema>

export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  scheduled: "Скоро",
  live: "LIVE",
  finished: "Завершён",
  cancelled: "Отменён",
}

export const matchFormatSchema = z.enum(["bo1", "bo3", "bo5"])
export type MatchFormat = z.infer<typeof matchFormatSchema>

export const MATCH_FORMAT_LABEL: Record<MatchFormat, string> = {
  bo1: "BO1",
  bo3: "BO3",
  bo5: "BO5",
}

export const matchMapStatusSchema = z.enum(["upcoming", "live", "finished"])
export type MatchMapStatus = z.infer<typeof matchMapStatusSchema>

export const matchMapWireSchema = z.object({
  name: z.string().min(1),
  side1_score: z.number().int().nonnegative(),
  side2_score: z.number().int().nonnegative(),
  status: matchMapStatusSchema,
  pick: z.enum(["side1", "side2", "decider"]),
})

export type MatchMap = {
  name: string
  side1Score: number
  side2Score: number
  status: MatchMapStatus
  pick: "side1" | "side2" | "decider"
}

export const matchSideWireSchema = z.object({
  team: teamRefSchema,
  score: z.number().int().nonnegative(),
  is_winner: z.boolean(),
})

export type MatchSide = {
  team: TeamRef
  score: number
  isWinner: boolean
}

export const streamLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.url(),
  language: z.string().min(1),
  viewers: z.number().int().nonnegative(),
})

export type StreamLink = z.infer<typeof streamLinkSchema>

export const matchPlayerStatWireSchema = z.object({
  player: playerRefSchema,
  kills: z.number().int().nonnegative(),
  deaths: z.number().int().nonnegative(),
  assists: z.number().int().nonnegative(),
  adr: z.number(),
  kast: z.number(),
  rating: z.number(),
})

export type MatchPlayerStat = {
  player: PlayerRef
  kills: number
  deaths: number
  assists: number
  adr: number
  kast: number
  rating: number
}

export const bracketSlotWireSchema = z.object({
  round: z.number().int().positive(),
  round_title: z.string().min(1),
  position: z.number().int().positive(),
})

export type BracketSlot = {
  round: number
  roundTitle: string
  position: number
}

export const matchWireSchema = z.object({
  id: matchIdSchema,
  tournament: tournamentRefSchema,
  stage: z.string().min(1),
  bracket: bracketSlotWireSchema.nullable().default(null),
  status: matchStatusSchema,
  format: matchFormatSchema,
  starts_at: z.iso.datetime(),
  teams: z.tuple([matchSideWireSchema, matchSideWireSchema]),
  maps: z.array(matchMapWireSchema),
  streams: z.array(streamLinkSchema),
  lineups: z.tuple([z.array(playerRefSchema), z.array(playerRefSchema)]),
  statistics: z.tuple([
    z.array(matchPlayerStatWireSchema),
    z.array(matchPlayerStatWireSchema),
  ]).nullable(),
})

export type MatchWire = z.infer<typeof matchWireSchema>

export type MatchGame = {
  position: number
  winnerTeamId: string | null
  lengthSeconds: number | null
  finished: boolean
}

export type MatchScore = {
  side1: number
  side2: number
}

export type Match = {
  id: MatchId
  tournament: TournamentRef
  stage: string
  bracket: BracketSlot | null
  status: MatchStatus
  format: MatchFormat
  startsAt: Date
  teams: [MatchSide, MatchSide]
  score: MatchScore | null
  maps: MatchMap[]
  games: MatchGame[]
  streams: StreamLink[]
  lineups: [PlayerRef[], PlayerRef[]]
  statistics: [MatchPlayerStat[], MatchPlayerStat[]] | null
}

export type MatchListKind = "live" | "upcoming" | "results"
