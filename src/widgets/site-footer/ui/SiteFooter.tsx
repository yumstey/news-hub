import { ExternalLink } from "lucide-react"
import Link from "next/link"

import { FOOTER_NAV, ROUTES, SITE } from "@/shared/config"
import { Container, Stack } from "@/shared/ui/container"
import { Separator } from "@/shared/ui/separator"
import { Heading, Text } from "@/shared/ui/typography"

const DATA_SOURCES = [
  { label: "PandaScore", url: "https://pandascore.co" },
  { label: "Liquipedia", url: "https://liquipedia.net/counterstrike" },
  { label: "Valve Regional Standings", url: "https://github.com/ValveSoftware/counter-strike_regional_standings" },
  { label: "Steam", url: "https://store.steampowered.com/app/730" },
  { label: "Skinport", url: "https://skinport.com" },
  { label: "CSGO-API", url: "https://github.com/ByMykel/CSGO-API" },
  { label: "bo3.gg", url: "https://bo3.gg" },
  { label: "Cybersport.ru", url: "https://www.cybersport.ru/tags/cs2" },
  { label: "YouTube", url: "https://www.youtube.com" },
] as const

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted">
      <Container className="py-section">
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Stack gap="sm" className="max-w-narrow">
            <Link
              href={ROUTES.home}
              className="rounded-control text-subheading font-bold tracking-tight text-foreground"
            >
              {SITE.name}
            </Link>
            <Text size="caption" tone="muted">
              {SITE.description}
            </Text>
          </Stack>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FOOTER_NAV.map((group) => (
              <Stack key={group.title} gap="sm">
                <Heading level={2} size="subheading" className="text-caption uppercase tracking-wider text-subtle-foreground">
                  {group.title}
                </Heading>
                <ul className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="rounded-control text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Stack>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        <Stack gap="sm">
          <Heading
            level={2}
            size="subheading"
            className="text-caption uppercase tracking-wider text-subtle-foreground"
          >
            Источники данных
          </Heading>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {DATA_SOURCES.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="inline-flex items-center gap-1.5 rounded-control text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                >
                  {source.label}
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
          <Text size="caption" tone="subtle">
            Расписание, результаты и профили — PandaScore. Составы, турниры и карты матчей —
            Liquipedia (CC BY-SA 3.0). Мировой рейтинг — региональные таблицы Valve. Карьерная
            статистика игроков — bo3.gg. Цены скинов — Skinport, предметы — CSGO-API, обновления и
            онлайн — Steam. Новости — открытые RSS-ленты изданий, видео — официальные каналы YouTube.
          </Text>
        </Stack>

        <Separator className="my-8" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Text size="caption" tone="subtle" className="max-w-content">
            Сайт не связан с Valve Corporation. Counter-Strike и логотипы игры — товарные знаки Valve.
            Данные предоставляются «как есть» и могут отличаться от официальных.
          </Text>
          <Link
            href={ROUTES.advertise}
            className="shrink-0 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            Реклама на сайте
          </Link>
        </div>
      </Container>
    </footer>
  )
}
