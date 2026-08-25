import { PANDA_MAX_PER_PAGE } from "@/shared/api"

export const CS2_PATH = "/csgo"
export const DEFAULT_PAGE_SIZE = 50

export function pageSize(limit: number | undefined): number {
  const requested = limit ?? DEFAULT_PAGE_SIZE

  return Math.min(Math.max(1, Math.trunc(requested)), PANDA_MAX_PER_PAGE)
}
