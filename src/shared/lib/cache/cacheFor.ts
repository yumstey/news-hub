import { cacheLife } from "next/cache"

export type CacheProfile = "reference" | "prices" | "feed" | "schedule" | "article"

/**
 * Срок кэша по исходу: удачный ответ живёт весь профиль, сбой источника —
 * минуты. Иначе один таймаут внешнего API на часы оставлял раздел пустым.
 * Next разрешает один вызов cacheLife на выполнение, поэтому решение
 * принимается в конце функции, когда исход уже известен.
 */
export function cacheFor(profile: CacheProfile, healthy: boolean): void {
  if (!healthy) {
    cacheLife("minutes")
    return
  }

  // Профили типизированы литералами, поэтому каждый вызываем явно.
  switch (profile) {
    case "reference":
      cacheLife("reference")
      return
    case "prices":
      cacheLife("prices")
      return
    case "feed":
      cacheLife("feed")
      return
    case "schedule":
      cacheLife("schedule")
      return
    case "article":
      cacheLife("article")
      return
  }
}
