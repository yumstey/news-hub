import type { UpdateBlock, UpdateListItem } from "../model/gameUpdate"

const CLAN_IMAGES = "https://clan.akamai.steamstatic.com/images"

/** Разделы патчноутов Valve, которые встречаются чаще всего. */
const SECTION_LABEL: Record<string, string> = {
  MAPS: "Карты",
  MAP: "Карты",
  GAMEPLAY: "Геймплей",
  MISC: "Разное",
  MISCELLANEOUS: "Разное",
  ANIMATION: "Анимация",
  ANIMATIONS: "Анимация",
  AUDIO: "Звук",
  SOUND: "Звук",
  ITEMS: "Предметы",
  UI: "Интерфейс",
  "USER INTERFACE": "Интерфейс",
  NETWORKING: "Сеть",
  NETWORK: "Сеть",
  PREMIER: "Premier",
  "COMPETITIVE MODES": "Соревновательные режимы",
  MATCHMAKING: "Подбор игр",
  WORKSHOP: "Мастерская",
  "STEAM WORKSHOP": "Мастерская",
  "MAP SCRIPTING": "Скрипты карт",
  GRAPHICS: "Графика",
  RENDERING: "Графика",
  WEAPONS: "Оружие",
  "WEAPON BALANCE": "Баланс оружия",
  STORE: "Магазин",
  ARMORY: "Арсенал",
  "ANTI-CHEAT": "Античит",
  STABILITY: "Стабильность",
  "PERFORMANCE": "Производительность",
  "CS2 COMMUNITY": "Сообщество",
  "DEMO": "Демо",
  "DEMOS": "Демо",
  RADAR: "Радар",
  HUD: "HUD",
  "LINUX": "Linux",
  "MAC": "Mac",
}

export function sectionLabel(raw: string): string {
  const key = raw.trim().toUpperCase()

  if (SECTION_LABEL[key] !== undefined) return SECTION_LABEL[key]

  // Названия карт и прочие собственные имена: «INFERNO» → «Inferno».
  return key.charAt(0) + key.slice(1).toLowerCase()
}

function inline(raw: string): string {
  return raw
    .replace(/\[url=[^\]]*\]([\s\S]*?)\[\/url\]/gi, "$1")
    .replace(/\[\/?(b|i|u|strike|spoiler|noparse|code|quote)[^\]]*\]/gi, "")
    // Прочие теги ([previewyoutube=…], [expand …]) — служебные; экранированные \[CT\] не трогаем.
    .replace(/(?<!\\)\[\/?[a-z][a-z0-9]*(?:[= ][^\]]*)?\]/gi, "")
    .replace(/\\\[/g, "[")
    .replace(/\\\]/g, "]")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** «[ MAP SCRIPTING ]» — так Valve оформляет разделы патчноутов. */
function asHeading(text: string): string | null {
  const match = /^\[\s*([^=\]]+?)\s*\]$/.exec(text)

  return match?.[1] === undefined ? null : sectionLabel(match[1])
}

type ListFrame = { items: UpdateListItem[]; current: UpdateListItem | null }

// Порядок групп: картинка, видео (атрибуты), таблица (содержимое), затем обычные теги.
const TOKEN =
  /\[img\]([\s\S]*?)\[\/img\]|\[video([^\]]*)\]\s*\[\/video\]|\[table\]([\s\S]*?)\[\/table\]|\[(\/?)(list|olist|\*|p|h1|h2|h3|h4|h5|carousel)\]/gi

function attribute(raw: string, name: string): string | null {
  const value = new RegExp(`\\b${name}="([^"]+)"`).exec(raw)?.[1]?.replace("{STEAM_CLAN_IMAGE}", CLAN_IMAGES)

  return value !== undefined && /^https:\/\//.test(value) ? value : null
}

/** [tr][th]Позиция[/th][td]…[/td][/tr] → строки таблицы. */
function parseTable(raw: string): { header: boolean; cells: string[] }[] {
  return [...raw.matchAll(/\[tr\]([\s\S]*?)\[\/tr\]/gi)].flatMap((row) => {
    const cells = [...(row[1] ?? "").matchAll(/\[(th|td)\]([\s\S]*?)\[\/(?:th|td)\]/gi)]

    if (cells.length === 0) return []

    return [
      {
        header: cells.every((cell) => cell[1]?.toLowerCase() === "th"),
        cells: cells.map((cell) => inline(cell[2] ?? "")),
      },
    ]
  })
}

/**
 * Разбирает BBCode новостей Steam в плоские блоки: заголовки, абзацы,
 * вложенные списки и картинки. Неизвестные теги превращаются в текст.
 */
export function parseSteamNotes(content: string): UpdateBlock[] {
  const blocks: UpdateBlock[] = []
  const stack: ListFrame[] = []
  let buffer = ""
  let heading = false

  const pushText = (raw: string): void => {
    const top = stack.at(-1)

    if (top !== undefined) {
      const text = inline(raw)

      if (text.length === 0) return

      if (top.current === null) {
        top.current = { text, children: [] }
        top.items.push(top.current)
      } else {
        top.current.text = top.current.text.length === 0 ? text : `${top.current.text} ${text}`
      }

      return
    }

    buffer += raw
  }

  const flush = (): void => {
    // Вне тегов Valve разделяет абзацы пустой строкой.
    for (const chunk of buffer.split(/\n\s*\n/)) {
      const text = inline(chunk)

      if (text.length === 0) continue

      const section = heading ? text : asHeading(text)

      blocks.push(section === null ? { kind: "paragraph", text } : { kind: "heading", text: section })
    }

    buffer = ""
    heading = false
  }

  let cursor = 0

  for (const match of content.matchAll(TOKEN)) {
    const index = match.index ?? 0

    pushText(content.slice(cursor, index))
    cursor = index + match[0].length

    const [, image, video, table, closing, tag] = match

    if (image !== undefined) {
      if (stack.length === 0) {
        flush()

        const src = image.trim().replace("{STEAM_CLAN_IMAGE}", CLAN_IMAGES)

        if (/^https:\/\//.test(src)) blocks.push({ kind: "image", src })
      }

      continue
    }

    if (video !== undefined) {
      if (stack.length === 0) {
        flush()

        const mp4 = attribute(video, "mp4")
        const webm = attribute(video, "webm")

        if (mp4 !== null || webm !== null) {
          blocks.push({ kind: "video", mp4, webm, poster: attribute(video, "poster") })
        }
      }

      continue
    }

    if (table !== undefined) {
      if (stack.length === 0) {
        flush()

        const rows = parseTable(table)

        if (rows.length > 0) blocks.push({ kind: "table", rows })
      }

      continue
    }

    const name = tag?.toLowerCase()

    // Карусель — лишь обёртка вокруг картинок: сами картинки разберутся как обычно.
    if (name === "carousel") continue

    if (name === "list" || name === "olist") {
      if (closing === "/") {
        const frame = stack.pop()

        if (frame === undefined) continue

        const parent = stack.at(-1)

        if (parent?.current != null) parent.current.children.push(...frame.items)
        else if (frame.items.length > 0) blocks.push({ kind: "list", items: frame.items })
      } else {
        if (stack.length === 0) flush()

        stack.push({ items: [], current: null })
      }

      continue
    }

    if (name === "*") {
      const top = stack.at(-1)

      if (top !== undefined && closing !== "/") top.current = null

      continue
    }

    if (stack.length > 0) continue

    // Абзац закрывается и открывается одинаково: всё накопленное — отдельный блок.
    if (name === "p") {
      flush()
      continue
    }

    if (name === "h1" || name === "h2" || name === "h3" || name === "h4" || name === "h5") {
      flush()
      heading = closing !== "/"
    }
  }

  pushText(content.slice(cursor))
  flush()

  while (stack.length > 0) {
    const frame = stack.pop()

    if (frame !== undefined && frame.items.length > 0) blocks.push({ kind: "list", items: frame.items })
  }

  return blocks
}

export function countChanges(blocks: readonly UpdateBlock[]): number {
  const count = (items: readonly UpdateListItem[]): number =>
    items.reduce((sum, item) => sum + (item.children.length === 0 ? 1 : count(item.children)), 0)

  return blocks.reduce((sum, block) => sum + (block.kind === "list" ? count(block.items) : 0), 0)
}
