export type UpdateListItem = {
  text: string
  children: UpdateListItem[]
}

export type UpdateBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: UpdateListItem[] }
  | { kind: "image"; src: string }
  /** Ролик Valve: зацикленная анимация без звука, как в оригинальном анонсе. */
  | { kind: "video"; mp4: string | null; webm: string | null; poster: string | null }
  | { kind: "table"; rows: { header: boolean; cells: string[] }[] }

export type GameUpdateKind = "patch" | "announcement"

export type GameUpdateSummary = {
  id: string
  slug: string
  kind: GameUpdateKind
  /** Русский заголовок для патчей, оригинальный — для анонсов. */
  title: string
  originalTitle: string
  publishedAt: Date
  excerpt: string
  cover: string | null
  /** Сколько правок перечислено — наглядная «величина» патча. */
  changeCount: number
  sections: string[]
}

export type GameUpdate = GameUpdateSummary & {
  blocks: UpdateBlock[]
  sourceUrl: string
}

export type OnlinePlayers = {
  count: number
  fetchedAt: Date
}
