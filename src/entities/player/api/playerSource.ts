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
  no: { code: "NO", name: "Норвегия" },
  fi: { code: "FI", name: "Финляндия" },
  kz: { code: "KZ", name: "Казахстан" },
  lv: { code: "LV", name: "Латвия" },
  ee: { code: "EE", name: "Эстония" },
  ca: { code: "CA", name: "Канада" },
  es: { code: "ES", name: "Испания" },
  tr: { code: "TR", name: "Турция" },
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
  nvg: { id: "team-nvg", slug: "northern-vanguard", name: "Northern Vanguard", short_name: "NVG", logo: logo(1, "Northern Vanguard") },
  emb: { id: "team-emb", slug: "ember-collective", name: "Ember Collective", short_name: "EMB", logo: logo(2, "Ember Collective") },
  sol: { id: "team-sol", slug: "solaris-esports", name: "Solaris Esports", short_name: "SOL", logo: logo(3, "Solaris Esports") },
  kry: { id: "team-kry", slug: "kryptic", name: "Kryptic", short_name: "KRY", logo: logo(4, "Kryptic") },
  vx9: { id: "team-vx9", slug: "vertex-nine", name: "Vertex Nine", short_name: "VX9", logo: logo(5, "Vertex Nine") },
  irc: { id: "team-irc", slug: "ironclad", name: "Ironclad", short_name: "IRC", logo: logo(6, "Ironclad") },
  mrd: { id: "team-mrd", slug: "meridian", name: "Meridian", short_name: "MRD", logo: logo(7, "Meridian") },
  zno: { id: "team-zno", slug: "zenith-order", name: "Zenith Order", short_name: "ZNO", logo: logo(8, "Zenith Order") },
} as const

type Stats = readonly [number, number, number, number, number, number, number, number]
type Achievement = readonly [string, string, number, string]

type PlayerInput = {
  slug: string
  nick: string
  real: string
  country: (typeof C)[keyof typeof C]
  role: "igl" | "awper" | "entry" | "rifler" | "support" | "coach"
  age: number
  team: (typeof T)[keyof typeof T] | null
  s: Stats
  a: readonly Achievement[]
}

function player(index: number, input: PlayerInput) {
  const [rating, kd, adr, kast, headshots, impact, maps, rounds] = input.s

  return {
    id: `plr-${String(index).padStart(3, "0")}`,
    slug: input.slug,
    discipline: CS2,
    nickname: input.nick,
    real_name: input.real,
    photo: null,
    country: input.country,
    role: input.role,
    age: input.age,
    team: input.team,
    stats: {
      rating,
      kd,
      adr,
      kast,
      headshots,
      impact,
      maps_played: maps,
      rounds_played: rounds,
    },
    achievements: input.a.map(([title, event, year, placement]) => ({
      title,
      event,
      year,
      placement,
    })),
    seo: {
      title: `${input.nick} — профиль игрока CS2`,
      description: `${input.nick} (${input.real}) — ${input.country.name}. Рейтинг, статистика, состав и достижения игрока Counter-Strike 2.`,
    },
  }
}

const INPUTS: readonly PlayerInput[] = [
  { slug: "vexo", nick: "vexo", real: "Emil Rask", country: C.se, role: "awper", age: 23, team: T.nvg,
    s: [1.24, 1.21, 86.4, 73.8, 46.2, 1.31, 486, 12140],
    a: [["Чемпион", "Aurora Major 2026", 2026, "1-е место"], ["Финалист", "Ironclad Invitational", 2025, "2-е место"]] },
  { slug: "holt", nick: "holt", real: "Anton Holt", country: C.se, role: "igl", age: 28, team: T.nvg,
    s: [1.02, 0.99, 71.6, 71.2, 42.8, 0.94, 612, 15320],
    a: [["Чемпион", "Aurora Major 2026", 2026, "1-е место"]] },
  { slug: "n0va", nick: "n0va", real: "Kasper Lind", country: C.no, role: "entry", age: 22, team: T.nvg,
    s: [1.14, 1.09, 83.1, 70.4, 52.6, 1.18, 402, 9980],
    a: [["Чемпион", "Aurora Major 2026", 2026, "1-е место"]] },
  { slug: "synd", nick: "synd", real: "Oskar Lund", country: C.se, role: "rifler", age: 25, team: T.nvg,
    s: [1.11, 1.08, 79.5, 72.6, 48.1, 1.09, 528, 13260],
    a: [["Чемпион", "Aurora Major 2026", 2026, "1-е место"]] },
  { slug: "kaide", nick: "kaide", real: "Ville Aho", country: C.fi, role: "support", age: 26, team: T.nvg,
    s: [0.98, 0.96, 68.2, 74.1, 39.4, 0.88, 574, 14380],
    a: [["Чемпион", "Aurora Major 2026", 2026, "1-е место"]] },

  { slug: "frostk", nick: "frostk", real: "Mads Bjerre", country: C.dk, role: "awper", age: 24, team: T.emb,
    s: [1.19, 1.16, 84.8, 72.9, 44.7, 1.26, 442, 11020],
    a: [["Финалист", "Aurora Major 2026", 2026, "2-е место"], ["Чемпион", "Solaris Cup Season 6", 2025, "1-е место"]] },
  { slug: "kolde", nick: "kolde", real: "Jonas Kolde", country: C.dk, role: "igl", age: 29, team: T.emb,
    s: [1.00, 0.97, 70.4, 71.8, 41.2, 0.92, 664, 16580],
    a: [["Финалист", "Aurora Major 2026", 2026, "2-е место"]] },
  { slug: "mikz", nick: "mikz", real: "Mikkel Sand", country: C.dk, role: "entry", age: 21, team: T.emb,
    s: [1.16, 1.12, 85.6, 69.8, 54.3, 1.22, 318, 7940],
    a: [["Финалист", "Aurora Major 2026", 2026, "2-е место"]] },
  { slug: "vaultz", nick: "vaultz", real: "Rasmus Toft", country: C.dk, role: "rifler", age: 26, team: T.emb,
    s: [1.09, 1.06, 78.2, 73.4, 47.6, 1.06, 556, 13920],
    a: [["Чемпион", "Solaris Cup Season 6", 2025, "1-е место"]] },
  { slug: "pyre", nick: "pyre", real: "Elias Berg", country: C.no, role: "support", age: 27, team: T.emb,
    s: [0.96, 0.94, 66.8, 73.6, 38.9, 0.86, 598, 14960],
    a: [["Финалист", "Aurora Major 2026", 2026, "2-е место"]] },

  { slug: "zaryn", nick: "zaryn", real: "Igor Zaremba", country: C.pl, role: "awper", age: 25, team: T.sol,
    s: [1.17, 1.14, 83.9, 72.2, 43.8, 1.24, 468, 11680],
    a: [["Чемпион", "Solaris Cup Season 7", 2026, "1-е место"]] },
  { slug: "krokk", nick: "krokk", real: "Bartosz Krol", country: C.pl, role: "igl", age: 30, team: T.sol,
    s: [0.99, 0.96, 69.8, 70.9, 40.6, 0.90, 702, 17520],
    a: [["Чемпион", "Solaris Cup Season 7", 2026, "1-е место"], ["Полуфиналист", "Aurora Major 2026", 2026, "3-4-е место"]] },
  { slug: "stavo", nick: "stavo", real: "Piotr Stawicki", country: C.pl, role: "entry", age: 23, team: T.sol,
    s: [1.13, 1.10, 84.2, 69.4, 53.1, 1.20, 386, 9640],
    a: [["Чемпион", "Solaris Cup Season 7", 2026, "1-е место"]] },
  { slug: "miqu", nick: "miqu", real: "Michal Kuc", country: C.pl, role: "rifler", age: 24, team: T.sol,
    s: [1.08, 1.05, 77.6, 72.8, 46.9, 1.04, 494, 12360],
    a: [["Чемпион", "Solaris Cup Season 7", 2026, "1-е место"]] },
  { slug: "lemi", nick: "lemi", real: "Rihards Lemis", country: C.lv, role: "support", age: 26, team: T.sol,
    s: [0.97, 0.95, 67.4, 73.9, 39.8, 0.87, 542, 13540],
    a: [["Чемпион", "Solaris Cup Season 7", 2026, "1-е место"]] },

  { slug: "shvts", nick: "shvts", real: "Danylo Shvets", country: C.ua, role: "awper", age: 22, team: T.kry,
    s: [1.26, 1.23, 88.1, 74.2, 45.4, 1.35, 358, 8920],
    a: [["Полуфиналист", "Aurora Major 2026", 2026, "3-4-е место"], ["MVP", "Vertex Masters Berlin", 2025, "1-е место"]] },
  { slug: "boyko", nick: "boyko", real: "Artem Boyko", country: C.ua, role: "igl", age: 27, team: T.kry,
    s: [1.01, 0.98, 71.2, 71.6, 42.1, 0.93, 588, 14680],
    a: [["Полуфиналист", "Aurora Major 2026", 2026, "3-4-е место"]] },
  { slug: "vitr", nick: "vitr", real: "Vitalii Rudenko", country: C.ua, role: "entry", age: 24, team: T.kry,
    s: [1.12, 1.08, 82.6, 69.9, 51.8, 1.17, 424, 10580],
    a: [["MVP", "Vertex Masters Berlin", 2025, "1-е место"]] },
  { slug: "hadze", nick: "hadze", real: "Nikita Hadze", country: C.kz, role: "rifler", age: 25, team: T.kry,
    s: [1.07, 1.04, 76.8, 72.4, 47.2, 1.03, 512, 12780],
    a: [["Полуфиналист", "Aurora Major 2026", 2026, "3-4-е место"]] },
  { slug: "lynxo", nick: "lynxo", real: "Marat Ilyin", country: C.kz, role: "support", age: 28, team: T.kry,
    s: [0.95, 0.93, 65.9, 73.2, 38.4, 0.85, 626, 15640],
    a: [["Полуфиналист", "Aurora Major 2026", 2026, "3-4-е место"]] },

  { slug: "ambr", nick: "ambr", real: "Hugo Ambroise", country: C.fr, role: "awper", age: 26, team: T.vx9,
    s: [1.15, 1.12, 82.4, 71.8, 44.2, 1.21, 496, 12380],
    a: [["Чемпион", "Vertex Masters Berlin", 2025, "1-е место"]] },
  { slug: "lucen", nick: "lucen", real: "Lucas Nery", country: C.fr, role: "igl", age: 29, team: T.vx9,
    s: [0.98, 0.95, 68.6, 70.6, 40.9, 0.89, 648, 16180],
    a: [["Чемпион", "Vertex Masters Berlin", 2025, "1-е место"]] },
  { slug: "tibz", nick: "tibz", real: "Thibault Roche", country: C.fr, role: "entry", age: 23, team: T.vx9,
    s: [1.10, 1.07, 81.8, 68.9, 52.4, 1.15, 372, 9280],
    a: [["Чемпион", "Vertex Masters Berlin", 2025, "1-е место"]] },
  { slug: "maro", nick: "maro", real: "Marc Olivet", country: C.es, role: "rifler", age: 25, team: T.vx9,
    s: [1.06, 1.03, 75.9, 71.9, 46.1, 1.02, 468, 11680],
    a: [["Финалист", "Solaris Cup Season 7", 2026, "2-е место"]] },
  { slug: "fenq", nick: "fenq", real: "Yann Fenech", country: C.fr, role: "support", age: 27, team: T.vx9,
    s: [0.94, 0.92, 65.2, 72.8, 37.8, 0.84, 584, 14580],
    a: [["Чемпион", "Vertex Masters Berlin", 2025, "1-е место"]] },

  { slug: "kaiov", nick: "kaiov", real: "Caio Vasques", country: C.br, role: "awper", age: 24, team: T.irc,
    s: [1.18, 1.15, 85.2, 72.6, 43.1, 1.25, 452, 11280],
    a: [["Чемпион", "Ironclad Invitational", 2025, "1-е место"]] },
  { slug: "duqz", nick: "duqz", real: "Eduardo Queiroz", country: C.br, role: "igl", age: 31, team: T.irc,
    s: [0.97, 0.94, 68.1, 70.2, 41.6, 0.88, 738, 18420],
    a: [["Чемпион", "Ironclad Invitational", 2025, "1-е место"]] },
  { slug: "brann", nick: "brann", real: "Bruno Andrade", country: C.br, role: "entry", age: 22, team: T.irc,
    s: [1.14, 1.11, 86.8, 68.4, 55.2, 1.23, 336, 8380],
    a: [["Чемпион", "Ironclad Invitational", 2025, "1-е место"]] },
  { slug: "tavi", nick: "tavi", real: "Otavio Lima", country: C.br, role: "rifler", age: 26, team: T.irc,
    s: [1.05, 1.02, 75.1, 71.4, 45.8, 1.01, 524, 13080],
    a: [["Чемпион", "Ironclad Invitational", 2025, "1-е место"]] },
  { slug: "lipo", nick: "lipo", real: "Felipe Rocha", country: C.br, role: "support", age: 28, team: T.irc,
    s: [0.93, 0.91, 64.6, 72.4, 37.2, 0.83, 612, 15280],
    a: [["Чемпион", "Ironclad Invitational", 2025, "1-е место"]] },

  { slug: "stahl", nick: "stahl", real: "Jonas Stahl", country: C.de, role: "awper", age: 25, team: T.mrd,
    s: [1.12, 1.09, 81.6, 71.2, 42.6, 1.18, 476, 11880],
    a: [["Финалист", "Vertex Masters Berlin", 2025, "2-е место"]] },
  { slug: "reuss", nick: "reuss", real: "Tim Reuss", country: C.de, role: "igl", age: 28, team: T.mrd,
    s: [0.96, 0.93, 67.2, 70.4, 40.1, 0.87, 594, 14840],
    a: [["Финалист", "Vertex Masters Berlin", 2025, "2-е место"]] },
  { slug: "krenz", nick: "krenz", real: "Paul Krenz", country: C.de, role: "entry", age: 23, team: T.mrd,
    s: [1.09, 1.06, 80.9, 68.6, 51.2, 1.14, 348, 8680],
    a: [["Финалист", "Vertex Masters Berlin", 2025, "2-е место"]] },
  { slug: "obiv", nick: "obiv", real: "Karl Obiv", country: C.ee, role: "rifler", age: 27, team: T.mrd,
    s: [1.04, 1.01, 74.6, 71.1, 45.2, 1.00, 538, 13420],
    a: [["Полуфиналист", "Solaris Cup Season 7", 2026, "3-4-е место"]] },
  { slug: "meko", nick: "meko", real: "Anton Mehl", country: C.de, role: "support", age: 26, team: T.mrd,
    s: [0.92, 0.90, 64.1, 72.1, 36.9, 0.82, 566, 14140],
    a: [["Финалист", "Vertex Masters Berlin", 2025, "2-е место"]] },

  { slug: "quarn", nick: "quarn", real: "Quinn Arnold", country: C.us, role: "awper", age: 23, team: T.zno,
    s: [1.13, 1.10, 82.1, 70.9, 44.9, 1.19, 394, 9840],
    a: [["Полуфиналист", "Ironclad Invitational", 2025, "3-4-е место"]] },
  { slug: "delto", nick: "delto", real: "Derek Alton", country: C.us, role: "igl", age: 30, team: T.zno,
    s: [0.95, 0.92, 66.4, 69.8, 39.6, 0.86, 682, 17040],
    a: [["Полуфиналист", "Ironclad Invitational", 2025, "3-4-е место"]] },
  { slug: "rhyz", nick: "rhyz", real: "Ryan Hall", country: C.ca, role: "entry", age: 21, team: T.zno,
    s: [1.08, 1.05, 80.2, 68.1, 50.6, 1.13, 302, 7540],
    a: [["Полуфиналист", "Ironclad Invitational", 2025, "3-4-е место"]] },
  { slug: "maxo", nick: "maxo", real: "Max Oren", country: C.us, role: "rifler", age: 24, team: T.zno,
    s: [1.03, 1.00, 73.8, 70.8, 44.6, 0.99, 456, 11380],
    a: [["Полуфиналист", "Ironclad Invitational", 2025, "3-4-е место"]] },
  { slug: "tavik", nick: "tavik", real: "Emre Tavik", country: C.tr, role: "support", age: 27, team: T.zno,
    s: [0.91, 0.89, 63.4, 71.6, 36.2, 0.81, 548, 13680],
    a: [["Полуфиналист", "Ironclad Invitational", 2025, "3-4-е место"]] },
]

export const PLAYER_SOURCE = INPUTS.map((input, index) => player(index + 1, input))
