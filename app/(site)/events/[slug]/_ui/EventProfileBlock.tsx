import { Building2, Globe, ListOrdered, MapPin, Trophy, Users } from "lucide-react"

import { getEventProfile } from "@/entities/tournament"
import type { EventProfile } from "@/entities/tournament"
import { cn } from "@/shared/lib/style"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Text } from "@/shared/ui/typography"

const USD = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

function Fact({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span aria-hidden="true" className="mt-0.5 text-border-strong">
        {icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-overline uppercase tracking-wider text-subtle-foreground">{label}</span>
        <span className="text-caption font-semibold text-foreground">{children}</span>
      </span>
    </div>
  )
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-3 rounded-surface border border-border bg-surface p-5", className)}>
      <SectionHeading title={title} level={3} />
      {children}
    </section>
  )
}

function hasContent(profile: EventProfile): boolean {
  return (
    profile.organizer !== null ||
    profile.venue !== null ||
    profile.format.length > 0 ||
    profile.prizes.length > 0 ||
    profile.participants.length > 0
  )
}

export type EventProfileBlockProps = {
  tournamentId: string
  name: string
}

/**
 * Карточка турнира с Liquipedia: организатор, площадка, формат, распределение
 * призовых и составы участников — данные, которых нет в матчевом API.
 */
export async function EventProfileBlock({ tournamentId, name }: EventProfileBlockProps) {
  const result = await getEventProfile(tournamentId, name)

  if (!result.ok) return null

  const profile = result.data

  if (!hasContent(profile)) return null

  const place = [profile.city, profile.country].filter((part) => part !== null).join(", ")

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading title="О турнире" />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
        <Card title="Организация" className="lg:col-span-1">
          <div className="flex flex-col gap-3">
            {profile.organizer === null ? null : (
              <Fact icon={<Building2 className="size-4" />} label="Организатор">
                {profile.organizer}
              </Fact>
            )}
            {place.length === 0 ? null : (
              <Fact icon={<MapPin className="size-4" />} label="Место">
                {place}
                {profile.offline === null ? null : ` · ${profile.offline ? "LAN" : "онлайн"}`}
              </Fact>
            )}
            {profile.venue === null ? null : (
              <Fact icon={<Building2 className="size-4" />} label="Площадка">
                {profile.venue}
              </Fact>
            )}
            {profile.teamCount === null ? null : (
              <Fact icon={<Users className="size-4" />} label="Команд">
                {profile.teamCount}
              </Fact>
            )}
            {profile.valveTier === null ? null : (
              <Fact icon={<Trophy className="size-4" />} label="Статус Valve">
                {profile.valveTier}
              </Fact>
            )}
            {profile.website === null ? null : (
              <Fact icon={<Globe className="size-4" />} label="Сайт">
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {profile.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </a>
              </Fact>
            )}
          </div>
        </Card>

        {profile.format.length === 0 ? null : (
          <Card title="Формат">
            <ul className="flex flex-col gap-1.5">
              {profile.format.map((line, index) => (
                <li
                  key={`${index}-${line}`}
                  className={cn(
                    "text-caption leading-relaxed",
                    line.startsWith("—") ? "pl-3 text-muted-foreground" : "font-semibold text-foreground",
                  )}
                >
                  {line}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {profile.prizes.length === 0 ? null : (
          <Card title="Призовые">
            <ul className="flex flex-col divide-y divide-border">
              {profile.prizes.map((prize) => (
                <li key={prize.place} className="flex items-center justify-between gap-3 py-1.5">
                  <span className="flex items-center gap-2 text-caption text-muted-foreground">
                    <ListOrdered aria-hidden="true" className="size-3.5 text-border-strong" />
                    {prize.place} место
                  </span>
                  <span className="text-caption font-bold tabular-nums text-foreground">
                    {prize.usd === null ? "—" : USD.format(prize.usd)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {profile.participants.length === 0 ? null : (
        <Card title="Составы участников">
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {profile.participants.map((entry) => (
              <li key={entry.team} className="flex flex-col gap-1 rounded-control border border-border bg-elevated/50 p-3">
                <span className="truncate text-caption font-bold text-foreground">{entry.team}</span>
                <span className="text-caption text-muted-foreground">{entry.players.join(", ")}</span>
                {entry.coach === null ? null : (
                  <span className="text-overline uppercase tracking-wider text-subtle-foreground">
                    Тренер: {entry.coach}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {profile.page === null ? null : (
        <Text size="caption" tone="subtle">
          Источник данных о турнире —{" "}
          <a
            href={profile.page}
            target="_blank"
            rel="noopener noreferrer external"
            className="text-primary underline-offset-2 hover:underline"
          >
            Liquipedia
          </a>
          , лицензия CC BY-SA 3.0.
        </Text>
      )}
    </section>
  )
}
