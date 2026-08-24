import Link from "next/link"

import { MAIN_NAV, ROUTES, SITE } from "@/shared/config"
import { Container } from "@/shared/ui/container"

import { MobileNav } from "./MobileNav"
import { SiteNav } from "./SiteNav"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-sm">
      <Container className="flex h-header items-center justify-between gap-4">
        <Link
          href={ROUTES.home}
          className="rounded-control text-subheading font-bold tracking-tight text-foreground"
        >
          {SITE.name}
        </Link>

        <SiteNav
          items={MAIN_NAV}
          label="Основная навигация"
          className="hidden md:flex"
        />

        <MobileNav
          items={MAIN_NAV}
          label="Мобильная навигация"
          openLabel="Открыть меню"
          closeLabel="Закрыть меню"
          className="md:hidden"
        />
      </Container>
    </header>
  )
}
