import { ArrowRight, UserMinus, UserRoundX } from "lucide-react"

import type { RosterMember } from "@/entities/team"
import { formatDate } from "@/shared/lib/date"
import { CountryTag } from "@/shared/ui/country-tag"
import { toCountry } from "@/shared/model"
import { SectionHeading } from "@/shared/ui/section-heading"

const LIMIT = 6

type Change = {
  member: RosterMember
  date: Date
  kind: "bench" | "left"
}

function parseDate(value: string | null): Date | null {
  if (value === null) return null

  const time = Date.parse(value)

  return Number.isFinite(time) ? new Date(time) : null
}

/** Скамейка и уходы, свежие первыми: календарь изменений состава. */
function changes(inactive: readonly RosterMember[], former: readonly RosterMember[]): Change[] {
  const collected: Change[] = []

  for (const member of inactive) {
    const date = parseDate(member.joinedAt)

    if (date !== null) collected.push({ member, date, kind: "bench" })
  }

  for (const member of former) {
    const date = parseDate(member.leftAt)

    if (date !== null) collected.push({ member, date, kind: "left" })
  }

  return collected.sort((left, right) => right.date.getTime() - left.date.getTime()).slice(0, LIMIT)
}

export type RosterChangesProps = {
  inactive: readonly RosterMember[]
  former: readonly RosterMember[]
}

/**
 * Что происходило с составом: кто на скамейке и кто ушёл. Данные Liquipedia —
 * трансферы там правят в день объявления.
 */
export function RosterChanges({ inactive, former }: RosterChangesProps) {
  const rows = changes(inactive, former)

  if (rows.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading title="Изменения состава" />

      <div className="overflow-hidden rounded-surface border border-border bg-surface">
        <ul className="divide-y divide-border">
          {rows.map(({ member, date, kind }) => (
            <li key={`${member.nickname}-${kind}`} className="flex items-center gap-3 px-4 py-3">
              <span
                aria-hidden="true"
                className={kind === "left" ? "text-danger" : "text-warning"}
              >
                {kind === "left" ? (
                  <UserRoundX className="size-4" />
                ) : (
                  <UserMinus className="size-4" />
                )}
              </span>

              <span className="flex min-w-0 flex-1 items-center gap-2">
                <CountryTag country={toCountry(member.countryCode)} />
                <span className="truncate text-caption font-semibold text-foreground">
                  {member.nickname}
                </span>
                {member.realName === null ? null : (
                  <span className="hidden truncate text-overline tracking-normal text-subtle-foreground sm:inline">
                    {member.realName}
                  </span>
                )}
              </span>

              <span className="flex shrink-0 items-center gap-2 text-caption text-muted-foreground">
                {kind === "left" ? "ушёл" : "на скамейке"}
                {member.newTeam === null ? null : (
                  <>
                    <ArrowRight aria-hidden="true" className="size-3 text-subtle-foreground" />
                    <span className="font-semibold text-foreground">{member.newTeam}</span>
                  </>
                )}
              </span>

              <time
                dateTime={date.toISOString()}
                className="w-20 shrink-0 text-right text-overline tabular-nums tracking-normal text-subtle-foreground"
              >
                {formatDate(date)}
              </time>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
