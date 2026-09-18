import { ExternalLink } from "lucide-react"

import type { PlayerProfile } from "@/entities/player"
import { formatDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/style"
import { pluralize } from "@/shared/lib/text"
import { SectionHeading } from "@/shared/ui/section-heading"

const SPELL_PREVIEW = 10

const STATUS_LABEL: Record<string, string> = {
  active: "Активен",
  inactive: "Не в основе",
  retired: "Завершил карьеру",
  banned: "Забанен",
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-overline uppercase text-subtle-foreground">{label}</span>
      <span className="text-caption font-medium text-foreground">{value}</span>
    </div>
  )
}

export function PlayerProfileCard({ profile }: { profile: PlayerProfile }) {
  const facts: { label: string; value: string }[] = []

  if (profile.birthDate !== null) {
    facts.push({ label: "Дата рождения", value: formatDate(profile.birthDate) })
  }

  if (profile.status !== null) {
    facts.push({
      label: "Статус",
      value: STATUS_LABEL[profile.status.toLowerCase()] ?? profile.status,
    })
  }

  if (profile.yearsActive !== null) {
    facts.push({ label: "В про-сцене", value: profile.yearsActive })
  }

  if (profile.roles.length > 0) {
    facts.push({ label: "Роли", value: profile.roles.join(" · ") })
  }

  if (profile.nicknames.length > 0) {
    facts.push({ label: "Прозвища", value: profile.nicknames.join(", ") })
  }

  const spells = profile.spells.slice(0, SPELL_PREVIEW)

  if (facts.length === 0 && spells.length === 0 && profile.links.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading title="Профиль" />

      <div className="flex flex-col gap-5 rounded-surface border border-border bg-surface p-5">
        {facts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {facts.map((fact) => (
              <Fact key={fact.label} label={fact.label} value={fact.value} />
            ))}
          </div>
        ) : null}

        {spells.length > 0 ? (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <span className="text-overline uppercase text-subtle-foreground">
              Клубная карьера
            </span>
            <ol className="flex flex-col">
              {spells.map((spell, index) => (
                <li
                  key={`${spell.team}-${spell.period}`}
                  className="flex items-baseline gap-3 py-1.5"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2 shrink-0 translate-y-px rounded-full",
                      index === 0 ? "bg-primary" : "bg-border-strong",
                    )}
                  />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-caption",
                      index === 0 ? "font-semibold text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {spell.team}
                    {spell.note === null ? null : (
                      <span className="ml-2 text-overline uppercase text-subtle-foreground">
                        {spell.note}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-caption tabular-nums text-subtle-foreground">
                    {spell.period}
                  </span>
                </li>
              ))}
            </ol>
            {profile.spells.length > spells.length ? (
              <span className="text-caption text-subtle-foreground">
                И ещё{" "}
                {pluralize(profile.spells.length - spells.length, [
                  "команда",
                  "команды",
                  "команд",
                ])}{" "}
                ранее.
              </span>
            ) : null}
          </div>
        ) : null}

        {profile.links.length > 0 ? (
          <ul className="flex flex-wrap gap-2 border-t border-border pt-4">
            {profile.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 rounded-control border border-border px-3 text-caption text-muted-foreground",
                    "transition-colors duration-150 hover:border-primary/40 hover:text-primary",
                  )}
                >
                  {link.label}
                  <ExternalLink className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
