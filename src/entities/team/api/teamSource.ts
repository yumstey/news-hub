const CS2 = { id: "dis-cs2", slug: "cs2", title: "Counter-Strike 2", kind: "esport" } as const

const C = {
  se: { code: "SE", name: "Швеция" },
  dk: { code: "DK", name: "Дания" },
  pl: { code: "PL", name: "Польша" },
  ua: { code: "UA", name: "Украина" },
  fr: { code: "FR", name: "Франция" },
  br: { code: "BR", name: "Бразилия" },
  de: { code: "DE", name: "Германия" },
  us: { code: "US", name: "США" },
} as const

function logo(index: number, name: string) {
  return {
    url: `/mock/teams/team-${String(index).padStart(2, "0")}.png`,
    width: 256,
    height: 256,
    alt: `Логотип ${name}`,
  }
}

type Form = readonly ("win" | "loss")[]

type TeamInput = {
  key: string
  logoIndex: number
  slug: string
  name: string
  short: string
  country: (typeof C)[keyof typeof C]
  region: string
  founded: number
  rank: number
  points: number
  change: number
  stats: readonly [number, number, number, number, number]
  form: Form
}

function team(input: TeamInput) {
  const [won, lost, maps, roundWinRate, streak] = input.stats

  return {
    id: `team-${input.key}`,
    slug: input.slug,
    discipline: CS2,
    name: input.name,
    short_name: input.short,
    logo: logo(input.logoIndex, input.name),
    country: input.country,
    region: input.region,
    founded_year: input.founded,
    world_ranking: input.rank,
    ranking_points: input.points,
    ranking_change: input.change,
    stats: {
      matches_won: won,
      matches_lost: lost,
      maps_played: maps,
      round_win_rate: roundWinRate,
      current_streak: streak,
    },
    recent_form: input.form,
    seo: {
      title: `${input.name} — состав, матчи и статистика CS2`,
      description: `${input.name}: место в мировом рейтинге, состав, ближайшие матчи, результаты и статистика команды Counter-Strike 2.`,
    },
  }
}

const INPUTS: readonly TeamInput[] = [
  {
    key: "nvg", logoIndex: 1, slug: "northern-vanguard", name: "Northern Vanguard", short: "NVG",
    country: C.se, region: "Европа", founded: 2016, rank: 1, points: 986, change: 0,
    stats: [64, 18, 196, 53.8, 6],
    form: ["win", "win", "win", "win", "loss"],
  },
  {
    key: "kry", logoIndex: 4, slug: "kryptic", name: "Kryptic", short: "KRY",
    country: C.ua, region: "Европа", founded: 2019, rank: 2, points: 921, change: 1,
    stats: [58, 21, 184, 52.9, 4],
    form: ["win", "win", "loss", "win", "win"],
  },
  {
    key: "emb", logoIndex: 2, slug: "ember-collective", name: "Ember Collective", short: "EMB",
    country: C.dk, region: "Европа", founded: 2014, rank: 3, points: 874, change: -1,
    stats: [55, 24, 190, 52.1, -2],
    form: ["loss", "loss", "win", "win", "win"],
  },
  {
    key: "sol", logoIndex: 3, slug: "solaris-esports", name: "Solaris Esports", short: "SOL",
    country: C.pl, region: "Европа", founded: 2017, rank: 4, points: 812, change: 2,
    stats: [51, 27, 178, 51.4, 3],
    form: ["win", "win", "win", "loss", "win"],
  },
  {
    key: "vx9", logoIndex: 5, slug: "vertex-nine", name: "Vertex Nine", short: "VX9",
    country: C.fr, region: "Европа", founded: 2015, rank: 5, points: 764, change: -1,
    stats: [47, 29, 172, 50.8, -1],
    form: ["loss", "win", "win", "loss", "win"],
  },
  {
    key: "irc", logoIndex: 6, slug: "ironclad", name: "Ironclad", short: "IRC",
    country: C.br, region: "Америка", founded: 2013, rank: 6, points: 702, change: 0,
    stats: [44, 31, 168, 50.2, 2],
    form: ["win", "win", "loss", "loss", "win"],
  },
  {
    key: "mrd", logoIndex: 7, slug: "meridian", name: "Meridian", short: "MRD",
    country: C.de, region: "Европа", founded: 2018, rank: 7, points: 648, change: -2,
    stats: [40, 34, 160, 49.6, -3],
    form: ["loss", "loss", "loss", "win", "win"],
  },
  {
    key: "zno", logoIndex: 8, slug: "zenith-order", name: "Zenith Order", short: "ZNO",
    country: C.us, region: "Америка", founded: 2020, rank: 8, points: 591, change: 1,
    stats: [36, 38, 154, 48.9, 1],
    form: ["win", "loss", "win", "loss", "loss"],
  },
]

export const TEAM_SOURCE = INPUTS.map(team)
