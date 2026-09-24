import { pandaList } from "@/shared/api"

import type { TeamRef } from "../model/team"
import { CS2_PATH } from "./pandaTeamEndpoints"
import { toTeamRef } from "./pandaTeamRef"
import { pandaTeamRefSchema } from "./pandaTeamRef"

const SEARCH_FALLBACK_LIMIT = 8

export function normaliseName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

async function byExactNames(names: readonly string[]): Promise<Map<string, TeamRef>> {
  const found = new Map<string, TeamRef>()

  if (names.length === 0) return found

  const result = await pandaList(`${CS2_PATH}/teams`, pandaTeamRefSchema, {
    "filter[name]": names.join(","),
    "page[size]": 100,
  })

  if (!result.ok) return found

  for (const wire of result.data) {
    const key = normaliseName(wire.name)

    if (!found.has(key)) found.set(key, toTeamRef(wire))
  }

  return found
}

/**
 * Valve пишет короткие названия («FUT», «G2»), PandaScore — полные
 * («FUT Esports»). Отбрасываем организационный суффикс, чтобы не терять команду.
 */
const ORG_SUFFIX = /(esports|esport|gaming|club)$/

function withoutOrgSuffix(value: string): string {
  return normaliseName(value).replace(ORG_SUFFIX, "")
}

async function bySearch(name: string): Promise<TeamRef | null> {
  // Поиск возвращает и «FUT Academy», и «FUT Turkuaz» — нужная команда может
  // оказаться далеко не первой, поэтому берём широкую выдачу.
  const result = await pandaList(`${CS2_PATH}/teams`, pandaTeamRefSchema, {
    "search[name]": name,
    "page[size]": 50,
  })

  if (!result.ok) return null

  const target = normaliseName(name)
  const exact = result.data.find((wire) => normaliseName(wire.name) === target)

  if (exact !== undefined) return toTeamRef(exact)

  const relaxed = result.data.find((wire) => withoutOrgSuffix(wire.name) === target)

  return relaxed === undefined ? null : toTeamRef(relaxed)
}

export async function resolveTeamRefs(
  names: readonly string[],
): Promise<Map<string, TeamRef>> {
  const resolved = await byExactNames(names)
  const missing = names.filter((name) => !resolved.has(normaliseName(name)))

  for (const name of missing.slice(0, SEARCH_FALLBACK_LIMIT)) {
    const found = await bySearch(name)

    if (found !== null) resolved.set(normaliseName(name), found)
  }

  return resolved
}
