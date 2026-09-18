import { ExternalLink, MessageSquare, Play, Users } from "lucide-react"
import Image from "next/image"
import { Suspense } from "react"

import { ACTIVE_DUTY, getGameMaps, MapImage } from "@/entities/game-map"
import { getGameInfo, getOnlinePlayers, STEAM_ART } from "@/entities/game-update"
import type { GameInfo } from "@/entities/game-update"
import { ROUTES, SITE_URL } from "@/shared/config"
import { cn } from "@/shared/lib/style"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { buttonClassName } from "@/shared/ui/button"
import { Container, Section, Stack } from "@/shared/ui/container"
import { JsonLd } from "@/shared/ui/json-ld"
import { SectionHeading } from "@/shared/ui/section-heading"
import { Skeleton } from "@/shared/ui/skeleton"
import { LatestUpdates } from "@/widgets/game-hub"
import { FaqBlock } from "@/widgets/skin-market"
import type { FaqEntry } from "@/widgets/skin-market"

import { breadcrumbsJsonLd, trail } from "../_lib/breadcrumbs"
import { buildMetadata } from "../_lib/metadata"

const TITLE = "Counter-Strike 2: системные требования, онлайн и обновления"
const DESCRIPTION =
  "Всё о CS2: минимальные системные требования, сколько весит игра, онлайн в Steam прямо сейчас, скриншоты, трейлеры, карты активного пула и последние обновления."

const CRUMBS = trail({ label: "Об игре" })

export function generateMetadata() {
  return buildMetadata(TITLE, DESCRIPTION, ROUTES.game, {
    keywords: [
      "системные требования cs2",
      "сколько весит кс2",
      "cs2 онлайн",
      "counter-strike 2 скачать",
      "кс2 бесплатно",
    ],
  })
}

function Fact({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-control border border-border bg-background/60 px-4 py-3 backdrop-blur-sm">
      <span className="flex items-center gap-1.5 text-overline uppercase text-subtle-foreground">
        {icon}
        {label}
      </span>
      <span className="text-subheading font-bold tabular-nums text-foreground">{value}</span>
    </div>
  )
}

async function Online() {
  const result = await getOnlinePlayers()

  return result.ok ? result.data.count.toLocaleString("ru-RU") : "—"
}

function faq(info: GameInfo): FaqEntry[] {
  const disk = info.requirements.find((entry) => /место|диск/i.test(entry.label))?.value
  const memory = info.requirements.find((entry) => /память|озу/i.test(entry.label))?.value
  const minimum = info.requirements.map((entry) => `${entry.label}: ${entry.value}`).join("; ")

  return [
    {
      question: "Сколько весит CS2?",
      answer: disk === undefined
        ? "Для установки Counter-Strike 2 нужно около 85 ГБ свободного места на диске."
        : `Для установки Counter-Strike 2 нужно ${disk.replace(/GB/i, "ГБ")} свободного места. Лучше ставить игру на SSD — так быстрее грузятся карты.`,
    },
    {
      question: "CS2 бесплатная?",
      answer:
        "Да, Counter-Strike 2 распространяется бесплатно в Steam. Премиум-статус открывает рейтинговый режим Premier и дропы предметов, но играть можно и без него.",
    },
    {
      question: "Какие минимальные системные требования у CS2?",
      answer: minimum.length > 0
        ? `Минимальные требования по данным Steam — ${minimum}.`
        : "Windows 10, 4-поточный процессор уровня Intel Core i5 750, 8 ГБ ОЗУ и видеокарта с 1 ГБ памяти и поддержкой DirectX 11.",
    },
    {
      question: "Пойдёт ли CS2 на слабом ПК?",
      answer: `Игра запускается от ${memory ?? "8 ГБ"} оперативной памяти, но для стабильных 144+ FPS в соревновательных матчах нужны современный процессор и видеокарта. Понизьте разрешение и качество теней, если FPS проседает.`,
    },
    {
      question: "Как часто выходят обновления CS2?",
      answer:
        "Valve выпускает патчи в среднем раз в одну-две недели: правки карт, баланса оружия и античита. Полный список изменений — в разделе «Обновления».",
    },
  ]
}

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbsJsonLd(CRUMBS)} />

      <section className="relative isolate overflow-hidden border-b border-border">
        <Image
          src={STEAM_ART.hero}
          alt=""
          fill
          sizes="100vw"
          quality={50}
          loading="eager"
          fetchPriority="high"
          className="-z-20 object-cover object-[70%_center] opacity-75"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-background via-background/80 to-background/10" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-linear-to-t from-background to-transparent" />

        <Container className="flex flex-col gap-6 py-8 sm:py-12">
          <Breadcrumbs items={CRUMBS} />
          <Image
            src={STEAM_ART.logo}
            alt="Counter-Strike 2"
            width={320}
            height={120}
            loading="eager"
            className="h-auto w-56 drop-shadow-2xl sm:w-72"
          />
          <h1 className="max-w-3xl text-heading font-bold tracking-tight sm:text-title">{TITLE}</h1>

          <Suspense fallback={<Skeleton variant="block" className="h-20 w-full max-w-2xl" />}>
            <HeroFacts />
          </Suspense>
        </Container>
      </section>

      <Container>
        <Section spacing="md">
          <Stack gap="xl">
            <Suspense fallback={<Skeleton variant="block" className="h-96 w-full" />}>
              <GameBody />
            </Suspense>
          </Stack>
        </Section>
      </Container>
    </>
  )
}

async function HeroFacts() {
  const result = await getGameInfo()
  const info = result.ok ? result.data : null

  return (
    <div className="flex flex-col gap-5">
      {info === null || info.description.length === 0 ? null : (
        <p className="max-w-content text-body text-muted-foreground sm:text-lead">{info.description}</p>
      )}
      <div className="grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4">
        <Fact
          label="В игре сейчас"
          icon={<Users aria-hidden="true" className="size-3.5" />}
          value={
            <Suspense fallback="…">
              <Online />
            </Suspense>
          }
        />
        <Fact
          label="Отзывов в Steam"
          icon={<MessageSquare aria-hidden="true" className="size-3.5" />}
          value={info?.reviews === null || info === null ? "—" : info.reviews.toLocaleString("ru-RU")}
        />
        <Fact label="Цена" value="Бесплатно" />
        <Fact label="Платформы" value={info === null || info.platforms.length === 0 ? "Windows" : info.platforms.join(", ")} />
      </div>
      <a
        href={info?.storeUrl ?? "https://store.steampowered.com/app/730/"}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClassName({ size: "lg", className: "w-fit" })}
      >
        Играть бесплатно в Steam
        <ExternalLink aria-hidden="true" className="size-4" />
      </a>
    </div>
  )
}

async function GameBody() {
  const [result, maps] = await Promise.all([getGameInfo(), getGameMaps()])
  const info = result.ok ? result.data : null
  const pool = (maps.ok ? maps.data : [])
    .filter((map) => ACTIVE_DUTY.includes(map.slug))
    .sort((left, right) => ACTIVE_DUTY.indexOf(left.slug) - ACTIVE_DUTY.indexOf(right.slug))

  return (
    <>
      {info === null ? null : (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: info.name,
            url: new URL(ROUTES.game, SITE_URL).toString(),
            description: info.description,
            image: STEAM_ART.header,
            genre: info.genres,
            gamePlatform: info.platforms,
            operatingSystem: info.platforms.join(", "),
            applicationCategory: "Game",
            author: { "@type": "Organization", name: "Valve" },
            publisher: { "@type": "Organization", name: "Valve" },
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
            ...(info.screenshots.length === 0 ? {} : { screenshot: info.screenshots.slice(0, 6).map((shot) => shot.full) }),
          }}
        />
      )}

      {pool.length === 0 ? null : (
        <section className="flex flex-col gap-4">
          <SectionHeading title="Карты активного пула" />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {pool.map((map) => (
              <li key={map.id} className="overflow-hidden rounded-surface border border-border">
                <span className="relative block aspect-video">
                  <MapImage map={map} fallbackName={map.name} sizes="(min-width: 1024px) 16rem, 50vw" className="absolute inset-0 size-full" />
                  <span className="absolute inset-x-0 bottom-0 p-2.5 text-caption font-bold uppercase tracking-wide text-white drop-shadow">
                    {map.name}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {info === null || info.screenshots.length === 0 ? null : (
        <section className="flex flex-col gap-4">
          <SectionHeading title="Скриншоты" />
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {info.screenshots.slice(0, 12).map((shot, index) => (
              <li key={shot.full} className={cn(index === 0 ? "col-span-2 row-span-2" : undefined)}>
                <a
                  href={shot.full}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-video overflow-hidden rounded-control border border-border bg-muted"
                >
                  <Image
                    src={index === 0 ? shot.full : shot.thumb}
                    alt={`Скриншот Counter-Strike 2 №${index + 1}`}
                    fill
                    quality={index === 0 ? 75 : 50}
                    sizes={index === 0 ? "(min-width: 1024px) 40rem, 100vw" : "(min-width: 1024px) 20rem, 50vw"}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {info === null || info.trailers.length === 0 ? null : (
        <section className="flex flex-col gap-4">
          <SectionHeading title="Трейлеры" />
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {info.trailers.map((trailer) => (
              <li key={trailer.id}>
                <a
                  href={info.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-2"
                >
                  <span className="relative block aspect-video overflow-hidden rounded-control border border-border bg-muted">
                    <Image src={trailer.thumb} alt="" fill sizes="(min-width: 1024px) 18rem, 50vw" className="object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors duration-200 group-hover:bg-black/10">
                      <span className="flex size-12 items-center justify-center rounded-full bg-white/90 text-black shadow-overlay transition-transform duration-200 group-hover:scale-110">
                        <Play aria-hidden="true" className="ml-0.5 size-5 fill-current" />
                      </span>
                    </span>
                  </span>
                  <span className="text-caption font-medium text-foreground group-hover:text-primary">{trailer.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {info === null || info.requirements.length === 0 ? null : (
        <section className="flex flex-col gap-4">
          <SectionHeading title="Минимальные системные требования" />
          <dl className="divide-y divide-border overflow-hidden rounded-surface border border-border bg-surface">
            {info.requirements.map((entry) => (
              <div key={entry.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
                <dt className="text-caption font-semibold text-subtle-foreground">{entry.label}</dt>
                <dd className="text-sm text-foreground">{entry.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <LatestUpdates limit={5} />

      {info === null ? null : <FaqBlock title="CS2: частые вопросы" entries={faq(info)} />}

      <p className="text-caption text-subtle-foreground">
        Описание, скриншоты, трейлеры и системные требования — магазин Steam. Counter-Strike 2 и
        связанные изображения — собственность Valve Corporation.
      </p>
    </>
  )
}
