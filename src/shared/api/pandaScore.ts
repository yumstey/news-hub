import "server-only"

import { z } from "zod"
import type { ZodType } from "zod"

import { SERVER_ENV } from "@/shared/config/server"
import type { Paginated } from "@/shared/model"

import { apiError } from "./apiError"
import type { ApiError } from "./apiError"
import { fail, ok } from "./apiResult"
import type { ApiResult } from "./apiResult"

export type QueryValue = string | number | boolean | undefined
export type PandaQuery = Record<string, QueryValue>

// Некоторые коллекции PandaScore отдают по несколько мегабайт за страницу,
// поэтому запас по времени больше, чем нужно обычному запросу.
const REQUEST_TIMEOUT_MS = 25_000
export const PANDA_MAX_PER_PAGE = 100

function buildUrl(path: string, query: PandaQuery | undefined): string {
  const base = `${SERVER_ENV.PANDASCORE_API_URL}/`
  const url = new URL(path.startsWith("/") ? path.slice(1) : path, base)

  if (query !== undefined) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue
      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

function errorFromStatus(status: number, path: string): ApiError {
  if (status === 404) {
    return apiError("not-found", `PandaScore: «${path}» не найден`, 404)
  }

  if (status === 401) {
    return apiError("http", "PandaScore: токен отклонён", 401)
  }

  if (status === 403) {
    return apiError("http", `PandaScore: «${path}» недоступен на текущем тарифе`, 403)
  }

  if (status === 429) {
    return apiError("http", "PandaScore: превышен часовой лимит запросов", 429)
  }

  return apiError("http", `PandaScore ответил ${status}`, status)
}

function reportContractError(path: string, error: z.ZodError): void {
  if (process.env.NODE_ENV === "production") return

  console.error(`[pandascore] contract mismatch on ${path}`, z.treeifyError(error))
}

type RawResponse = {
  body: unknown
  headers: Headers
}

async function request(path: string, query?: PandaQuery): Promise<ApiResult<RawResponse>> {
  let response: Response

  try {
    response = await fetch(buildUrl(path, query), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${SERVER_ENV.PANDASCORE_TOKEN}`,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    return fail(apiError("network", "PandaScore недоступен"))
  }

  if (!response.ok) {
    return fail(errorFromStatus(response.status, path))
  }

  try {
    const body: unknown = await response.json()

    return ok({ body, headers: response.headers })
  } catch {
    return fail(apiError("network", "PandaScore вернул некорректный JSON"))
  }
}

export async function pandaOne<T>(
  path: string,
  schema: ZodType<T>,
  query?: PandaQuery,
): Promise<ApiResult<T>> {
  const raw = await request(path, query)

  if (!raw.ok) return fail(raw.error)

  const parsed = schema.safeParse(raw.data.body)

  if (!parsed.success) {
    reportContractError(path, parsed.error)

    return fail(apiError("contract", `PandaScore: «${path}» не соответствует контракту`))
  }

  return ok(parsed.data)
}

export async function pandaList<T>(
  path: string,
  itemSchema: ZodType<T>,
  query?: PandaQuery,
): Promise<ApiResult<T[]>> {
  const raw = await request(path, query)

  if (!raw.ok) return fail(raw.error)

  const parsed = z.array(itemSchema).safeParse(raw.data.body)

  if (!parsed.success) {
    reportContractError(path, parsed.error)

    return fail(apiError("contract", `PandaScore: «${path}» не соответствует контракту`))
  }

  return ok(parsed.data)
}

function headerNumber(headers: Headers, name: string, fallback: number): number {
  const value = Number(headers.get(name))

  return Number.isFinite(value) && value > 0 ? value : fallback
}

export async function pandaPage<T>(
  path: string,
  itemSchema: ZodType<T>,
  query?: PandaQuery,
): Promise<ApiResult<Paginated<T>>> {
  const raw = await request(path, query)

  if (!raw.ok) return fail(raw.error)

  const parsed = z.array(itemSchema).safeParse(raw.data.body)

  if (!parsed.success) {
    reportContractError(path, parsed.error)

    return fail(apiError("contract", `PandaScore: «${path}» не соответствует контракту`))
  }

  const items = parsed.data
  const page = headerNumber(raw.data.headers, "X-Page", 1)
  const perPage = headerNumber(raw.data.headers, "X-Per-Page", items.length)
  const total = headerNumber(raw.data.headers, "X-Total", items.length)

  return ok({ items, page, perPage, total, hasNext: page * perPage < total })
}
