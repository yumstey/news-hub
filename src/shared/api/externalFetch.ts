import "server-only"

import type { ZodType } from "zod"

import { apiError } from "./apiError"
import { fail, ok } from "./apiResult"
import type { ApiResult } from "./apiResult"

const EXTERNAL_TIMEOUT_MS = 10_000

async function get(url: string, accept: string): Promise<ApiResult<Response>> {
  let response: Response

  try {
    response = await fetch(url, {
      headers: { Accept: accept, "User-Agent": "cs2-platform/1.0 (+https://github.com/; contact: tarpeetonteam@gmail.com)" },
      signal: AbortSignal.timeout(EXTERNAL_TIMEOUT_MS),
    })
  } catch {
    return fail(apiError("network", `Источник ${url} недоступен`))
  }

  if (response.status === 404) {
    return fail(apiError("not-found", `Источник ${url} не найден`, 404))
  }

  if (!response.ok) {
    return fail(apiError("http", `Источник ${url} ответил ${response.status}`, response.status))
  }

  return ok(response)
}

export async function fetchText(url: string): Promise<ApiResult<string>> {
  const result = await get(url, "text/plain")

  if (!result.ok) return fail(result.error)

  try {
    return ok(await result.data.text())
  } catch {
    return fail(apiError("network", `Источник ${url} вернул некорректный ответ`))
  }
}

export async function fetchJson<T>(url: string, schema: ZodType<T>): Promise<ApiResult<T>> {
  const result = await get(url, "application/json")

  if (!result.ok) return fail(result.error)

  let body: unknown

  try {
    body = await result.data.json()
  } catch {
    return fail(apiError("network", `Источник ${url} вернул некорректный JSON`))
  }

  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return fail(apiError("contract", `Источник ${url} не соответствует контракту`))
  }

  return ok(parsed.data)
}
