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

type TeamKey = keyof typeof T
type StandingInput = readonly [TeamKey, string, number, number, number, number]

function standings(rows: readonly StandingInput[]) {
  return rows.map(([key, placement, wins, losses, mapDiff, prize], index) => ({
    position: index + 1,
    placement,
    team: T[key],
    wins,
    losses,
    map_diff: mapDiff,
    prize,
  }))
}

export const TOURNAMENT_SOURCE = [
  {
    id: "trn-aurora-major-2026",
    slug: "aurora-major-2026",
    discipline: CS2,
    name: "Aurora Major 2026",
    short_name: "Aurora Major",
    tier: "s",
    status: "ongoing",
    prize_pool: 1250000,
    currency: "USD",
    format: "8 команд, швейцарская система и плей-офф",
    location: { city: "Копенгаген", country: C.dk, online: false },
    starts_at: "2026-08-18T10:00:00.000Z",
    ends_at: "2026-08-30T20:00:00.000Z",
    teams: [T.nvg, T.kry, T.emb, T.sol, T.vx9, T.irc, T.mrd, T.zno],
    standings: standings([
      ["nvg", "1-4-е место", 1, 0, 1, 0],
      ["kry", "1-4-е место", 1, 0, 2, 0],
      ["emb", "1-4-е место", 1, 0, 1, 0],
      ["sol", "1-4-е место", 1, 0, 2, 0],
      ["zno", "5-8-е место", 0, 1, -1, 60000],
      ["vx9", "5-8-е место", 0, 1, -2, 60000],
      ["irc", "5-8-е место", 0, 1, -1, 60000],
      ["mrd", "5-8-е место", 0, 1, -2, 60000],
    ]),
    description:
      "Главный турнир сезона: восемь команд в плей-офф, швейцарская система на первом этапе и гранд-финал до трёх побед.",
    seo: {
      title: "Aurora Major 2026",
      description:
        "Aurora Major 2026: призовой фонд, участники, расписание матчей, таблица и результаты турнира CS2 в Копенгагене.",
    },
  },
  {
    id: "trn-vertex-masters-berlin",
    slug: "vertex-masters-berlin",
    discipline: CS2,
    name: "Vertex Masters Berlin",
    short_name: "Vertex Masters",
    tier: "a",
    status: "upcoming",
    prize_pool: 500000,
    currency: "USD",
    format: "6 команд, двойная выбывающая сетка",
    location: { city: "Берлин", country: C.de, online: false },
    starts_at: "2026-09-12T12:00:00.000Z",
    ends_at: "2026-09-20T20:00:00.000Z",
    teams: [T.nvg, T.emb, T.sol, T.vx9, T.mrd, T.zno],
    standings: [],
    description:
      "Осенний мастерс в Берлине: шесть приглашённых команд и двойная выбывающая сетка на арене.",
    seo: {
      title: "Vertex Masters Berlin",
      description:
        "Vertex Masters Berlin: участники, призовой фонд, сетка и расписание матчей турнира CS2 в Берлине.",
    },
  },
  {
    id: "trn-solaris-cup-s7",
    slug: "solaris-cup-season-7",
    discipline: CS2,
    name: "Solaris Cup Season 7",
    short_name: "Solaris Cup S7",
    tier: "b",
    status: "finished",
    prize_pool: 150000,
    currency: "USD",
    format: "4 команды, плей-офф до трёх побед в финале",
    location: { city: "Онлайн", country: C.pl, online: true },
    starts_at: "2026-07-02T14:00:00.000Z",
    ends_at: "2026-07-14T20:00:00.000Z",
    teams: [T.sol, T.vx9, T.mrd, T.zno],
    standings: standings([
      ["sol", "1-е место", 2, 0, 4, 70000],
      ["vx9", "2-е место", 1, 1, -1, 40000],
      ["mrd", "3-4-е место", 0, 1, -2, 20000],
      ["zno", "3-4-е место", 0, 1, -1, 20000],
    ]),
    description:
      "Онлайн-серия: плей-офф из четырёх команд и путёвка в закрытую квалификацию мастерса.",
    seo: {
      title: "Solaris Cup Season 7",
      description:
        "Solaris Cup Season 7: итоговая таблица, результаты матчей, призовой фонд и участники онлайн-турнира CS2.",
    },
  },
  {
    id: "trn-ironclad-invitational",
    slug: "ironclad-invitational",
    discipline: CS2,
    name: "Ironclad Invitational",
    short_name: "Ironclad Inv.",
    tier: "a",
    status: "finished",
    prize_pool: 400000,
    currency: "USD",
    format: "8 команд, групповой этап и плей-офф",
    location: { city: "Сан-Паулу", country: C.br, online: false },
    starts_at: "2026-05-20T16:00:00.000Z",
    ends_at: "2026-05-28T22:00:00.000Z",
    teams: [T.irc, T.nvg, T.kry, T.zno, T.emb, T.sol, T.vx9, T.mrd],
    standings: standings([
      ["irc", "1-е место", 3, 0, 5, 160000],
      ["nvg", "2-е место", 2, 1, 2, 80000],
      ["kry", "3-4-е место", 1, 1, 0, 40000],
      ["zno", "3-4-е место", 1, 1, -1, 40000],
      ["emb", "5-8-е место", 0, 1, -1, 20000],
      ["sol", "5-8-е место", 0, 1, -1, 20000],
      ["vx9", "5-8-е место", 0, 1, -2, 20000],
      ["mrd", "5-8-е место", 0, 1, -2, 20000],
    ]),
    description:
      "Домашний турнир Ironclad в Сан-Паулу: восемь команд, полная арена и первый крупный титул для хозяев.",
    seo: {
      title: "Ironclad Invitational",
      description:
        "Ironclad Invitational: итоговая таблица, результаты, призовой фонд и участники турнира CS2 в Сан-Паулу.",
    },
  },
  {
    id: "trn-northern-series-finals",
    slug: "northern-series-finals",
    discipline: CS2,
    name: "Northern Series Finals",
    short_name: "Northern Finals",
    tier: "b",
    status: "upcoming",
    prize_pool: 200000,
    currency: "USD",
    format: "4 команды, круговой этап и финал",
    location: { city: "Стокгольм", country: C.se, online: false },
    starts_at: "2026-10-08T12:00:00.000Z",
    ends_at: "2026-10-13T20:00:00.000Z",
    teams: [T.nvg, T.emb, T.kry, T.mrd],
    standings: [],
    description:
      "Финалы северной серии: четыре команды, круговой этап и одиночный финал до трёх побед.",
    seo: {
      title: "Northern Series Finals",
      description:
        "Northern Series Finals: участники, призовой фонд, расписание и формат турнира CS2 в Стокгольме.",
    },
  },
] as const
