export type Paginated<T> = {
  items: T[]
  page: number
  perPage: number
  total: number
  hasNext: boolean
}

export function paginate<T>(items: readonly T[], page: number, perPage: number): Paginated<T> {
  const total = items.length
  const safePage = Math.max(1, Math.trunc(page))
  const start = (safePage - 1) * perPage

  return {
    items: items.slice(start, start + perPage) as T[],
    page: safePage,
    perPage,
    total,
    hasNext: start + perPage < total,
  }
}

export function pageCount(total: number, perPage: number): number {
  return Math.max(1, Math.ceil(total / perPage))
}
