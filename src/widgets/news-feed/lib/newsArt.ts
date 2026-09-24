import type { NewsItem } from "@/entities/news-item"
import { artForTitle } from "@/entities/game-update"
import type { GameArt } from "@/entities/game-update"

export type NewsArt = GameArt

export { loadGameArt as loadNewsArt } from "@/entities/game-update"
export { EMPTY_GAME_ART as EMPTY_NEWS_ART } from "@/entities/game-update"

/**
 * Обложка по смыслу: если в заголовке названа карта — её арт, иначе кадр игры.
 * Выбор детерминирован по id, чтобы карточка не «мигала» между рендерами.
 */
export function newsCover(item: NewsItem, art: NewsArt): string | null {
  if (item.image !== null) return null

  return artForTitle(item.title, item.id, art)
}
