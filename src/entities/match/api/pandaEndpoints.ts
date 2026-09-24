import { PANDA_MAX_PER_PAGE } from "@/shared/api"

export const CS2_PATH = "/csgo"
export const DEFAULT_PAGE_SIZE = 50

export function pageSize(limit: number | undefined): number {
  const requested = limit ?? DEFAULT_PAGE_SIZE

  return Math.min(Math.max(1, Math.trunc(requested)), PANDA_MAX_PER_PAGE)
}

/** Запас на матчи без даты: их отбрасывает маппер, а список должен быть полным. */
export function pageSizeWithSlack(limit: number | undefined): number {
  return pageSize(limit === undefined ? undefined : limit + 15)
}
