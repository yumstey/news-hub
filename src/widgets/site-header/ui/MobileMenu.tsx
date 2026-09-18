"use client"

import { Gamepad2, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import type { ReactNode } from "react"

import { HEADER_GROUP_LABEL, MAIN_NAV, ROUTES, SITE } from "@/shared/config"
import type { HeaderGroupKey } from "@/shared/config"
import { cn } from "@/shared/lib/style"

import { isSectionActive } from "../lib/isSectionActive"
import type { NavBadges } from "./DesktopNav"
import { NavIcon } from "./NavIcon"

const GROUPS: readonly HeaderGroupKey[] = ["esports", "game", "media"]

export type MobileMenuViewProps = {
  pathname: string | null
  badges?: NavBadges
  /** Шапка меню: логотип приходит с сервера, чтобы не тянуть его в клиент. */
  brand?: ReactNode
}

/**
 * Меню для экранов до 1024px: боковая панель на нативном <dialog> — фокус,
 * Esc и блокировку фона браузер делает сам.
 */
export function MobileMenuView({ pathname, badges = {}, brand }: MobileMenuViewProps) {
  const dialog = useRef<HTMLDialogElement>(null)

  const close = () => dialog.current?.close()

  // Переход назад кнопкой браузера меняет адрес при открытом меню — закрываем его.
  useEffect(() => {
    dialog.current?.close()
  }, [pathname])

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
        className="inline-flex size-9 items-center justify-center rounded-control border border-border text-foreground transition-colors duration-150 hover:bg-muted lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
        <span className="sr-only">Открыть меню</span>
      </button>

      <dialog
        ref={dialog}
        aria-label="Меню"
        onClick={(event) => {
          if (event.target === dialog.current) close()
        }}
        className="m-0 ml-auto h-dvh max-h-none w-[min(22rem,88vw)] max-w-none border-l border-border bg-background p-0 text-foreground backdrop:bg-overlay backdrop:backdrop-blur-sm open:animate-slide-in-right"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-header shrink-0 items-center justify-between gap-3 border-b border-border px-4">
            {brand ?? <span className="text-base font-bold">{SITE.shortName}</span>}
            <button
              type="button"
              onClick={close}
              className="inline-flex size-9 items-center justify-center rounded-control text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
            >
              <X aria-hidden="true" className="size-5" />
              <span className="sr-only">Закрыть меню</span>
            </button>
          </div>

          <nav aria-label="Разделы" className="flex-1 overflow-y-auto px-3 py-4">
            <Link
              href={ROUTES.home}
              onClick={close}
              aria-current={pathname === "/" ? "page" : undefined}
              className={cn(
                "mb-4 flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium",
                pathname === "/" ? "bg-primary-soft text-primary" : "text-foreground hover:bg-muted",
              )}
            >
              <NavIcon section="home" />
              Главная
            </Link>

            {GROUPS.map((group) => (
              <div key={group} className="mb-5 flex flex-col gap-1.5">
                <span className="px-3 text-overline uppercase text-subtle-foreground">
                  {HEADER_GROUP_LABEL[group]}
                </span>
                <ul className="grid grid-cols-2 gap-1.5">
                  {MAIN_NAV.filter((item) => item.group === group).map((item) => {
                    const active = isSectionActive(item.href, pathname)

                    return (
                      <li key={item.section}>
                        <Link
                          href={item.href}
                          onClick={close}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-11 items-center gap-2.5 rounded-control border px-3 py-2 text-sm font-medium transition-colors duration-150",
                            active
                              ? "border-primary/40 bg-primary-soft text-primary"
                              : "border-border bg-surface text-foreground hover:border-border-strong",
                          )}
                        >
                          <NavIcon section={item.section} className="size-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                          {badges[item.section] ?? null}
                        </Link>
                      </li>
                    )
                  })}
                  {group === "game" ? (
                    <li>
                      <Link
                        href={ROUTES.game}
                        onClick={close}
                        aria-current={pathname === ROUTES.game ? "page" : undefined}
                        className={cn(
                          "flex min-h-11 items-center gap-2.5 rounded-control border px-3 py-2 text-sm font-medium transition-colors duration-150",
                          pathname === ROUTES.game
                            ? "border-primary/40 bg-primary-soft text-primary"
                            : "border-border bg-surface text-foreground hover:border-border-strong",
                        )}
                      >
                        <Gamepad2 aria-hidden="true" className="size-4 shrink-0" />
                        <span className="truncate">Об игре</span>
                      </Link>
                    </li>
                  ) : null}
                </ul>
              </div>
            ))}
          </nav>

          <div className="shrink-0 border-t border-border px-4 py-3">
            <Link
              href={ROUTES.advertise}
              onClick={close}
              className="flex items-center gap-2 text-caption text-muted-foreground hover:text-foreground"
            >
              <NavIcon section="advertise" className="size-3.5" />
              Реклама на сайте
            </Link>
          </div>
        </div>
      </dialog>
    </>
  )
}

export function MobileMenu(props: Omit<MobileMenuViewProps, "pathname">) {
  const pathname = usePathname()

  return <MobileMenuView pathname={pathname} {...props} />
}
