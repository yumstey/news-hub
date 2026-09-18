import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

import { CS2, ROUTES, SITE } from "@/shared/config"
import { Container } from "@/shared/ui/container"

import { DesktopNav, DesktopNavView } from "./DesktopNav"
import type { NavBadges } from "./DesktopNav"
import { HeaderSearch } from "./HeaderSearch"
import { LiveBadge } from "./LiveBadge"
import { MobileMenu, MobileMenuView } from "./MobileMenu"

function Brand() {
  return (
    <Link href={ROUTES.home} className="flex shrink-0 items-center gap-2 rounded-control" aria-label={`${SITE.name} — на главную`}>
      <Image
        src={CS2.logo.url}
        alt=""
        width={28}
        height={28}
        loading="eager"
        className="size-7 shrink-0 rounded-sm object-cover"
      />
      <span className="text-base font-bold tracking-tight text-foreground">{SITE.shortName}</span>
    </Link>
  )
}

/**
 * Шапка в одну строку высотой --spacing-header на любой ширине: меню с
 * приоритетами (часть пунктов прячется в «Ещё» на средних экранах), поиск —
 * по кнопке, на телефоне — боковая панель.
 */
export function SiteHeader() {
  const badges: NavBadges = {
    matches: (
      <Suspense fallback={null}>
        <LiveBadge />
      </Suspense>
    ),
  }

  return (
    <header className="sticky top-0 z-50 h-header border-b border-border bg-background/85 backdrop-blur-md">
      <Container className="flex h-full items-center gap-3 lg:gap-5">
        <Brand />

        <Suspense fallback={<DesktopNavView pathname={null} badges={badges} />}>
          <DesktopNav badges={badges} />
        </Suspense>

        <div className="ml-auto flex items-center gap-2">
          <Suspense fallback={null}>
            <HeaderSearch />
          </Suspense>
          <Suspense fallback={<MobileMenuView pathname={null} badges={badges} brand={<Brand />} />}>
            <MobileMenu badges={badges} brand={<Brand />} />
          </Suspense>
        </div>
      </Container>
    </header>
  )
}
