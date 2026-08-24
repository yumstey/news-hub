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

type Role = "igl" | "awper" | "entry" | "rifler" | "support" | "coach"

function ref(id: number, slug: string, country: (typeof C)[keyof typeof C], role: Role) {
  return {
    id: `plr-${String(id).padStart(3, "0")}`,
    slug,
    nickname: slug,
    photo: null,
    country,
    role,
  }
}

export const ROSTERS = {
  nvg: [
    ref(2, "holt", C.se, "igl"),
    ref(1, "vexo", C.se, "awper"),
    ref(3, "n0va", C.no, "entry"),
    ref(4, "synd", C.se, "rifler"),
    ref(5, "kaide", C.fi, "support"),
  ],
  emb: [
    ref(7, "kolde", C.dk, "igl"),
    ref(6, "frostk", C.dk, "awper"),
    ref(8, "mikz", C.dk, "entry"),
    ref(9, "vaultz", C.dk, "rifler"),
    ref(10, "pyre", C.no, "support"),
  ],
  sol: [
    ref(12, "krokk", C.pl, "igl"),
    ref(11, "zaryn", C.pl, "awper"),
    ref(13, "stavo", C.pl, "entry"),
    ref(14, "miqu", C.pl, "rifler"),
    ref(15, "lemi", C.lv, "support"),
  ],
  kry: [
    ref(17, "boyko", C.ua, "igl"),
    ref(16, "shvts", C.ua, "awper"),
    ref(18, "vitr", C.ua, "entry"),
    ref(19, "hadze", C.kz, "rifler"),
    ref(20, "lynxo", C.kz, "support"),
  ],
  vx9: [
    ref(22, "lucen", C.fr, "igl"),
    ref(21, "ambr", C.fr, "awper"),
    ref(23, "tibz", C.fr, "entry"),
    ref(24, "maro", C.es, "rifler"),
    ref(25, "fenq", C.fr, "support"),
  ],
  irc: [
    ref(27, "duqz", C.br, "igl"),
    ref(26, "kaiov", C.br, "awper"),
    ref(28, "brann", C.br, "entry"),
    ref(29, "tavi", C.br, "rifler"),
    ref(30, "lipo", C.br, "support"),
  ],
  mrd: [
    ref(32, "reuss", C.de, "igl"),
    ref(31, "stahl", C.de, "awper"),
    ref(33, "krenz", C.de, "entry"),
    ref(34, "obiv", C.ee, "rifler"),
    ref(35, "meko", C.de, "support"),
  ],
  zno: [
    ref(37, "delto", C.us, "igl"),
    ref(36, "quarn", C.us, "awper"),
    ref(38, "rhyz", C.ca, "entry"),
    ref(39, "maxo", C.us, "rifler"),
    ref(40, "tavik", C.tr, "support"),
  ],
} as const

export type RosterKey = keyof typeof ROSTERS

export const COUNTRIES = C
