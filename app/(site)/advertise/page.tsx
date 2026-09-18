import { BarChart3, Crosshair, Mail, Megaphone, Radio, ShieldCheck, Swords, Trophy } from "lucide-react"

import { PUBLIC_ENV, ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { buttonClassName } from "@/shared/ui/button"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Heading, Text } from "@/shared/ui/typography"

import { buildMetadata } from "../_lib/metadata"
import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"

const TITLE = "Реклама на сайте"
const DESCRIPTION =
  "Размещение рекламы для аудитории Counter-Strike 2: баннеры, спонсорство разделов матчей и турниров, интеграции в каталог скинов и кейсов."

const CRUMBS = trail({ label: TITLE })

export function generateMetadata() {
  return buildMetadata(TITLE, DESCRIPTION, ROUTES.advertise)
}

const AUDIENCE = [
  {
    icon: Swords,
    title: "Фанаты киберспорта",
    text: "Следят за матчами в реальном времени, турнирными сетками и статистикой команд — возвращаются каждый игровой день.",
  },
  {
    icon: Crosshair,
    title: "Покупатели скинов",
    text: "Сравнивают цены и выбирают, где купить. Горячая аудитория с намерением покупки прямо на странице предмета.",
  },
  {
    icon: Radio,
    title: "Зрители эфиров",
    text: "Ищут трансляции матчей на Twitch, YouTube и Kick — идеальны для спонсорства турниров и стримеров.",
  },
] as const

const FORMATS = [
  {
    icon: Megaphone,
    title: "Баннер в боковой колонке",
    text: "На главной, в матчах, турнирах, скинах и обновлениях. Показ на каждой странице раздела.",
  },
  {
    icon: Trophy,
    title: "Спонсор турнира или раздела",
    text: "Брендирование страницы турнира, сетки или раздела «Матчи» с пометкой «При поддержке».",
  },
  {
    icon: BarChart3,
    title: "Партнёр маркетплейса",
    text: "Ваша площадка в блоке «Где купить» на страницах скинов и кейсов с оплатой за переход или продажу.",
  },
  {
    icon: ShieldCheck,
    title: "Нативная интеграция",
    text: "Материал в разделе новостей с пометкой «Реклама» — по правилам маркировки и без скрытых ссылок.",
  },
] as const

export default function Page() {
  const email = PUBLIC_ENV.NEXT_PUBLIC_CONTACT_EMAIL

  return (
    <Container>
      <Section spacing="md">
        <Stack gap="xl">
          <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />
          <Breadcrumbs items={CRUMBS} />

          <div className="relative overflow-hidden rounded-surface border border-border bg-linear-to-br from-primary-soft via-surface to-surface p-6 sm:p-10">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-primary/20 blur-3xl"
            />
            <div className="relative flex max-w-content flex-col gap-4">
              <span className="text-overline uppercase text-primary">Для брендов и маркетплейсов</span>
              <Heading level={1} size="display">
                Аудитория CS2, которая покупает
              </Heading>
              <Text size="lead" tone="muted">
                {DESCRIPTION}
              </Text>
              {email.length === 0 ? null : (
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent("Реклама на сайте CS2")}`}
                  className={buttonClassName({ size: "lg", className: "w-fit" })}
                >
                  <Mail aria-hidden="true" className="size-4" />
                  Написать нам
                </a>
              )}
            </div>
          </div>

          <section className="flex flex-col gap-4">
            <SectionHeading title="Кто нас читает" />
            <ul className="grid gap-3 md:grid-cols-3">
              {AUDIENCE.map((entry) => (
                <li key={entry.title} className="flex flex-col gap-2 rounded-surface border border-border bg-surface p-5">
                  <entry.icon aria-hidden="true" className="size-5 text-primary" />
                  <span className="text-subheading font-semibold">{entry.title}</span>
                  <span className="text-caption text-muted-foreground">{entry.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-4">
            <SectionHeading title="Форматы" />
            <ul className="grid gap-3 sm:grid-cols-2">
              {FORMATS.map((entry, index) => (
                <li
                  key={entry.title}
                  className={cn(
                    "flex gap-4 rounded-surface border bg-surface p-5",
                    index === 2 ? "border-primary/40" : "border-border",
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
                    <entry.icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">{entry.title}</span>
                    <span className="text-caption text-muted-foreground">{entry.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <Text size="caption" tone="subtle" className="max-w-content">
            Вся реклама на сайте маркируется. Ставки и азартные игры размещаются только с пометкой
            18+ и в странах, где это разрешено законом.
          </Text>
        </Stack>
      </Section>
    </Container>
  )
}
