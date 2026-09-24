import { getGameMaps } from "@/entities/game-map/@x/game-update"
import { EMPTY_GAME_INFO, getGameInfo } from "../api/getGameInfo"

export type GameArt = {
  maps: { keys: string[]; image: string }[]
  screenshots: string[]
}

export const EMPTY_GAME_ART: GameArt = { maps: [], screenshots: [] }

function compact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

/**
 * Арты карт и скриншоты игры: ими закрываются карточки без собственной
 * картинки — у турниров и новостей редко есть официальный логотип.
 */
export async function loadGameArt(): Promise<GameArt> {
  const [maps, info] = await Promise.all([getGameMaps(), getGameInfo()])

  return {
    maps: (maps.ok ? maps.data : []).flatMap((map) =>
      map.image === null
        ? []
        : [
            {
              keys: [...new Set([compact(map.name), compact(map.slug)])].filter((key) => key.length >= 4),
              image: map.image,
            },
          ],
    ),
    screenshots: (info.ok ? info.data : EMPTY_GAME_INFO).screenshots.map((shot) => shot.full),
  }
}

function seedIndex(seed: string, length: number): number {
  const sum = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0)

  return sum % length
}

/**
 * Кадр, закреплённый за строкой: один и тот же при каждом рендере.
 * "maps" — виды карт (сцены из игры), "screenshots" — кадры из Steam,
 * среди которых попадаются экраны интерфейса.
 */
export function artForSeed(seed: string, art: GameArt, prefer: "maps" | "screenshots" = "screenshots"): string | null {
  const pools = prefer === "maps" ? [art.maps.map((entry) => entry.image), art.screenshots] : [art.screenshots, art.maps.map((entry) => entry.image)]
  const pool = pools.find((entry) => entry.length > 0)

  if (pool === undefined) return null

  return pool[seedIndex(seed, pool.length)] ?? null
}

/** Если в тексте названа карта — её арт, иначе кадр по seed. */
export function artForTitle(
  title: string,
  seed: string,
  art: GameArt,
  prefer: "maps" | "screenshots" = "screenshots",
): string | null {
  const words = title.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 0)
  const map = art.maps.find((entry) => entry.keys.some((key) => words.includes(key)))

  return map?.image ?? artForSeed(seed, art, prefer)
}
