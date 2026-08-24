import { COUNTRIES as C, ROSTERS } from "./matchRosters"
import type { RosterKey } from "./matchRosters"

const CS2 = { id: "dis-cs2", slug: "cs2", title: "Counter-Strike 2", kind: "esport" } as const

function logo(index: number, name: string) {
  return {
    url: `/mock/teams/team-${String(index).padStart(2, "0")}.png`,
    width: 256,
    height: 256,
    alt: `Логотип ${name}`,
  }
}

const T = {
  nvg: { id: "team-nvg", slug: "northern-vanguard", name: "Northern Vanguard", shortName: "NVG", logo: logo(1, "Northern Vanguard"), country: C.se },
  emb: { id: "team-emb", slug: "ember-collective", name: "Ember Collective", shortName: "EMB", logo: logo(2, "Ember Collective"), country: C.dk },
  sol: { id: "team-sol", slug: "solaris-esports", name: "Solaris Esports", shortName: "SOL", logo: logo(3, "Solaris Esports"), country: C.pl },
  kry: { id: "team-kry", slug: "kryptic", name: "Kryptic", shortName: "KRY", logo: logo(4, "Kryptic"), country: C.ua },
  vx9: { id: "team-vx9", slug: "vertex-nine", name: "Vertex Nine", shortName: "VX9", logo: logo(5, "Vertex Nine"), country: C.fr },
  irc: { id: "team-irc", slug: "ironclad", name: "Ironclad", shortName: "IRC", logo: logo(6, "Ironclad"), country: C.br },
  mrd: { id: "team-mrd", slug: "meridian", name: "Meridian", shortName: "MRD", logo: logo(7, "Meridian"), country: C.de },
  zno: { id: "team-zno", slug: "zenith-order", name: "Zenith Order", shortName: "ZNO", logo: logo(8, "Zenith Order"), country: C.us },
} as const

const TRN = {
  aurora: { id: "trn-aurora-major-2026", slug: "aurora-major-2026", name: "Aurora Major 2026", tier: "s" },
  vertex: { id: "trn-vertex-masters-berlin", slug: "vertex-masters-berlin", name: "Vertex Masters Berlin", tier: "a" },
  solaris: { id: "trn-solaris-cup-s7", slug: "solaris-cup-season-7", name: "Solaris Cup Season 7", tier: "b" },
  ironclad: { id: "trn-ironclad-invitational", slug: "ironclad-invitational", name: "Ironclad Invitational", tier: "a" },
  northern: { id: "trn-northern-series-finals", slug: "northern-series-finals", name: "Northern Series Finals", tier: "b" },
} as const

const QF = "Четвертьфиналы"
const SF = "Полуфиналы"
const GF = "Гранд-финал"

type MapInput = readonly [string, number, number, "side1" | "side2" | "decider", "upcoming" | "live" | "finished"]
type StatInput = readonly [number, number, number, number, number, number, number]
type BracketInput = readonly [number, string, number]

type MatchInput = {
  id: string
  tournament: keyof typeof TRN
  stage: string
  status: "scheduled" | "live" | "finished"
  format: "bo1" | "bo3" | "bo5"
  at: string
  a: RosterKey
  b: RosterKey
  score?: readonly [number, number]
  bracket?: BracketInput
  maps?: readonly MapInput[]
  streams?: readonly (readonly [string, string, string, number])[]
  stats?: readonly [readonly StatInput[], readonly StatInput[]]
}

function side(key: RosterKey, score: number, winner: boolean) {
  return { team: T[key], score, is_winner: winner }
}

function statRows(key: RosterKey, rows: readonly StatInput[]) {
  return rows.map(([index, kills, deaths, assists, adr, kast, rating]) => ({
    player: ROSTERS[key][index] ?? ROSTERS[key][0],
    kills,
    deaths,
    assists,
    adr,
    kast,
    rating,
  }))
}

function match(input: MatchInput) {
  const [scoreA, scoreB] = input.score ?? [0, 0]

  return {
    id: input.id,
    discipline: CS2,
    tournament: TRN[input.tournament],
    stage: input.stage,
    bracket:
      input.bracket === undefined
        ? null
        : {
            round: input.bracket[0],
            round_title: input.bracket[1],
            position: input.bracket[2],
          },
    status: input.status,
    format: input.format,
    starts_at: input.at,
    teams: [
      side(input.a, scoreA, input.status === "finished" && scoreA > scoreB),
      side(input.b, scoreB, input.status === "finished" && scoreB > scoreA),
    ] as const,
    maps: (input.maps ?? []).map(([name, s1, s2, pick, status]) => ({
      name,
      side1_score: s1,
      side2_score: s2,
      pick,
      status,
    })),
    streams: (input.streams ?? []).map(([platform, url, language, viewers]) => ({
      platform,
      url,
      language,
      viewers,
    })),
    lineups: [ROSTERS[input.a], ROSTERS[input.b]] as const,
    statistics:
      input.stats === undefined
        ? null
        : ([statRows(input.a, input.stats[0]), statRows(input.b, input.stats[1])] as const),
  }
}

const TWITCH = "https://www.twitch.tv/example-cs2"
const YOUTUBE = "https://www.youtube.com/@example-cs2"

const INPUTS: readonly MatchInput[] = [
  {
    id: "mch-101", tournament: "aurora", stage: "Полуфинал", status: "live", format: "bo3",
    at: "2026-08-24T15:00:00.000Z", a: "nvg", b: "kry", score: [1, 0], bracket: [2, SF, 1],
    maps: [
      ["Mirage", 13, 9, "side1", "finished"],
      ["Inferno", 8, 6, "side2", "live"],
      ["Ancient", 0, 0, "decider", "upcoming"],
    ],
    streams: [
      ["Twitch", TWITCH, "RU", 48210],
      ["YouTube", YOUTUBE, "EN", 21640],
    ],
  },
  {
    id: "mch-102", tournament: "aurora", stage: "Полуфинал", status: "live", format: "bo3",
    at: "2026-08-24T18:30:00.000Z", a: "emb", b: "sol", score: [0, 1], bracket: [2, SF, 2],
    maps: [
      ["Nuke", 11, 13, "side2", "finished"],
      ["Anubis", 4, 2, "side1", "live"],
      ["Dust2", 0, 0, "decider", "upcoming"],
    ],
    streams: [["Twitch", TWITCH, "RU", 31280]],
  },
  {
    id: "mch-201", tournament: "aurora", stage: "Четвертьфинал", status: "finished", format: "bo3",
    at: "2026-08-22T15:00:00.000Z", a: "nvg", b: "zno", score: [2, 1], bracket: [1, QF, 1],
    maps: [
      ["Mirage", 13, 10, "side1", "finished"],
      ["Ancient", 9, 13, "side2", "finished"],
      ["Nuke", 13, 7, "decider", "finished"],
    ],
    stats: [
      [
        [1, 68, 49, 12, 88.4, 74.2, 1.34],
        [0, 52, 51, 21, 71.6, 71.8, 1.02],
        [2, 61, 54, 14, 83.2, 70.1, 1.16],
        [3, 57, 52, 17, 79.8, 72.4, 1.11],
        [4, 44, 55, 24, 66.9, 74.6, 0.95],
      ],
      [
        [1, 63, 55, 11, 84.1, 71.9, 1.18],
        [0, 48, 58, 19, 68.4, 69.8, 0.94],
        [2, 58, 57, 13, 81.6, 68.9, 1.09],
        [3, 51, 56, 16, 74.2, 71.1, 1.01],
        [4, 41, 59, 22, 64.8, 72.6, 0.89],
      ],
    ],
  },
  {
    id: "mch-202", tournament: "aurora", stage: "Четвертьфинал", status: "finished", format: "bo3",
    at: "2026-08-22T18:30:00.000Z", a: "kry", b: "vx9", score: [2, 0], bracket: [1, QF, 2],
    maps: [
      ["Anubis", 13, 8, "side1", "finished"],
      ["Inferno", 13, 11, "side2", "finished"],
    ],
    stats: [
      [
        [1, 51, 32, 8, 92.6, 77.4, 1.48],
        [0, 36, 36, 14, 72.1, 72.8, 1.03],
        [2, 42, 35, 9, 84.6, 71.2, 1.19],
        [3, 38, 34, 12, 77.9, 73.6, 1.08],
        [4, 29, 38, 17, 65.4, 75.1, 0.92],
      ],
      [
        [1, 38, 45, 7, 79.2, 66.8, 0.98],
        [0, 30, 47, 13, 64.6, 64.2, 0.82],
        [2, 35, 46, 8, 74.8, 65.4, 0.91],
        [3, 33, 44, 11, 70.1, 67.9, 0.88],
        [4, 24, 48, 15, 58.2, 68.4, 0.74],
      ],
    ],
  },
  {
    id: "mch-203", tournament: "aurora", stage: "Четвертьфинал", status: "finished", format: "bo3",
    at: "2026-08-21T15:00:00.000Z", a: "emb", b: "irc", score: [2, 1], bracket: [1, QF, 3],
    maps: [
      ["Dust2", 13, 11, "side1", "finished"],
      ["Nuke", 10, 13, "side2", "finished"],
      ["Mirage", 13, 9, "decider", "finished"],
    ],
    stats: [
      [
        [1, 66, 52, 10, 87.1, 73.4, 1.28],
        [0, 50, 54, 20, 70.2, 71.1, 0.99],
        [2, 62, 51, 12, 85.4, 69.6, 1.21],
        [3, 55, 53, 15, 77.8, 72.9, 1.07],
        [4, 43, 57, 23, 65.1, 73.8, 0.93],
      ],
      [
        [1, 64, 56, 11, 86.2, 72.1, 1.22],
        [0, 47, 58, 18, 67.4, 69.4, 0.92],
        [2, 60, 55, 10, 84.8, 68.2, 1.15],
        [3, 52, 57, 14, 74.6, 70.8, 0.99],
        [4, 40, 59, 21, 63.2, 71.9, 0.86],
      ],
    ],
  },
  {
    id: "mch-204", tournament: "aurora", stage: "Четвертьфинал", status: "finished", format: "bo3",
    at: "2026-08-21T18:30:00.000Z", a: "sol", b: "mrd", score: [2, 0], bracket: [1, QF, 4],
    maps: [
      ["Vertigo", 13, 6, "side1", "finished"],
      ["Ancient", 13, 10, "side2", "finished"],
    ],
    stats: [
      [
        [1, 46, 30, 9, 89.4, 76.2, 1.42],
        [0, 34, 33, 15, 70.8, 73.1, 1.04],
        [2, 41, 32, 8, 83.9, 70.6, 1.18],
        [3, 37, 31, 11, 76.4, 72.8, 1.06],
        [4, 27, 35, 16, 64.2, 74.4, 0.91],
      ],
      [
        [1, 33, 42, 6, 76.8, 65.9, 0.94],
        [0, 26, 44, 12, 62.4, 63.8, 0.79],
        [2, 31, 43, 7, 72.6, 64.6, 0.88],
        [3, 29, 41, 10, 68.9, 66.7, 0.85],
        [4, 21, 45, 14, 56.4, 67.2, 0.72],
      ],
    ],
  },
  {
    id: "mch-205", tournament: "aurora", stage: "Швейцарская система", status: "finished", format: "bo1",
    at: "2026-08-19T14:00:00.000Z", a: "nvg", b: "irc", score: [1, 0],
    maps: [["Inferno", 13, 5, "decider", "finished"]],
    stats: [
      [
        [1, 24, 12, 3, 96.2, 80.1, 1.62],
        [0, 17, 14, 6, 74.6, 76.4, 1.12],
        [2, 21, 13, 4, 88.4, 74.2, 1.34],
        [3, 19, 12, 5, 81.2, 77.8, 1.24],
        [4, 14, 15, 8, 67.8, 78.6, 1.01],
      ],
      [
        [1, 15, 21, 2, 68.4, 58.2, 0.78],
        [0, 11, 22, 5, 54.6, 55.4, 0.64],
        [2, 14, 21, 3, 64.2, 56.8, 0.72],
        [3, 13, 20, 4, 61.8, 59.6, 0.71],
        [4, 9, 23, 6, 48.2, 60.2, 0.58],
      ],
    ],
  },
  {
    id: "mch-104", tournament: "vertex", stage: "Групповой этап", status: "scheduled", format: "bo3",
    at: "2026-09-12T13:00:00.000Z", a: "vx9", b: "mrd",
  },
  {
    id: "mch-105", tournament: "vertex", stage: "Групповой этап", status: "scheduled", format: "bo3",
    at: "2026-09-13T15:00:00.000Z", a: "sol", b: "zno",
  },
  {
    id: "mch-106", tournament: "vertex", stage: "Плей-офф", status: "scheduled", format: "bo3",
    at: "2026-09-14T17:00:00.000Z", a: "nvg", b: "mrd",
  },
  {
    id: "mch-107", tournament: "northern", stage: "Круговой этап", status: "scheduled", format: "bo3",
    at: "2026-10-08T13:00:00.000Z", a: "emb", b: "kry",
  },
  {
    id: "mch-210", tournament: "ironclad", stage: "Четвертьфинал", status: "finished", format: "bo3",
    at: "2026-05-24T16:00:00.000Z", a: "irc", b: "mrd", score: [2, 0], bracket: [1, QF, 1],
    maps: [
      ["Inferno", 13, 8, "side1", "finished"],
      ["Mirage", 13, 10, "side2", "finished"],
    ],
  },
  {
    id: "mch-211", tournament: "ironclad", stage: "Четвертьфинал", status: "finished", format: "bo3",
    at: "2026-05-24T19:30:00.000Z", a: "zno", b: "sol", score: [2, 1], bracket: [1, QF, 2],
    maps: [
      ["Ancient", 13, 11, "side1", "finished"],
      ["Nuke", 7, 13, "side2", "finished"],
      ["Dust2", 13, 9, "decider", "finished"],
    ],
  },
  {
    id: "mch-212", tournament: "ironclad", stage: "Четвертьфинал", status: "finished", format: "bo3",
    at: "2026-05-25T16:00:00.000Z", a: "nvg", b: "vx9", score: [2, 0], bracket: [1, QF, 3],
    maps: [
      ["Mirage", 13, 6, "side1", "finished"],
      ["Anubis", 13, 9, "side2", "finished"],
    ],
  },
  {
    id: "mch-208", tournament: "ironclad", stage: "Четвертьфинал", status: "finished", format: "bo3",
    at: "2026-05-25T19:30:00.000Z", a: "kry", b: "emb", score: [2, 1], bracket: [1, QF, 4],
    maps: [
      ["Ancient", 13, 7, "side1", "finished"],
      ["Mirage", 10, 13, "side2", "finished"],
      ["Nuke", 13, 9, "decider", "finished"],
    ],
  },
  {
    id: "mch-213", tournament: "ironclad", stage: "Полуфинал", status: "finished", format: "bo3",
    at: "2026-05-27T16:00:00.000Z", a: "irc", b: "zno", score: [2, 0], bracket: [2, SF, 1],
    maps: [
      ["Inferno", 13, 9, "side1", "finished"],
      ["Vertigo", 13, 8, "side2", "finished"],
    ],
  },
  {
    id: "mch-214", tournament: "ironclad", stage: "Полуфинал", status: "finished", format: "bo3",
    at: "2026-05-27T19:30:00.000Z", a: "nvg", b: "kry", score: [2, 1], bracket: [2, SF, 2],
    maps: [
      ["Mirage", 13, 10, "side1", "finished"],
      ["Ancient", 11, 13, "side2", "finished"],
      ["Nuke", 13, 8, "decider", "finished"],
    ],
  },
  {
    id: "mch-207", tournament: "ironclad", stage: "Гранд-финал", status: "finished", format: "bo5",
    at: "2026-05-28T21:00:00.000Z", a: "irc", b: "nvg", score: [3, 2], bracket: [3, GF, 1],
    maps: [
      ["Inferno", 13, 10, "side1", "finished"],
      ["Mirage", 8, 13, "side2", "finished"],
      ["Dust2", 13, 11, "side1", "finished"],
      ["Nuke", 9, 13, "side2", "finished"],
      ["Ancient", 13, 12, "decider", "finished"],
    ],
  },
  {
    id: "mch-215", tournament: "solaris", stage: "Полуфинал", status: "finished", format: "bo3",
    at: "2026-07-13T13:00:00.000Z", a: "sol", b: "mrd", score: [2, 0], bracket: [1, SF, 1],
    maps: [
      ["Mirage", 13, 7, "side1", "finished"],
      ["Nuke", 13, 11, "side2", "finished"],
    ],
  },
  {
    id: "mch-209", tournament: "solaris", stage: "Полуфинал", status: "finished", format: "bo3",
    at: "2026-07-13T16:00:00.000Z", a: "vx9", b: "zno", score: [2, 1], bracket: [1, SF, 2],
    maps: [
      ["Dust2", 13, 8, "side1", "finished"],
      ["Vertigo", 10, 13, "side2", "finished"],
      ["Ancient", 13, 9, "decider", "finished"],
    ],
  },
  {
    id: "mch-206", tournament: "solaris", stage: "Гранд-финал", status: "finished", format: "bo5",
    at: "2026-07-14T17:00:00.000Z", a: "sol", b: "vx9", score: [3, 1], bracket: [2, GF, 1],
    maps: [
      ["Mirage", 13, 9, "side1", "finished"],
      ["Nuke", 11, 13, "side2", "finished"],
      ["Ancient", 13, 8, "side1", "finished"],
      ["Anubis", 13, 11, "side2", "finished"],
    ],
  },
]

export const MATCH_SOURCE = INPUTS.map(match)
