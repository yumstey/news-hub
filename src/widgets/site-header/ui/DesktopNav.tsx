"use client"

import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

import { MAIN_NAV } from "@/shared/config"
import type { SectionKey } from "@/shared/config"
import { cn } from "@/shared/lib/style"

import { isSectionActive } from "../lib/isSectionActive"
import { NavIcon } from "./NavIcon"

export type NavBadges = Partial<Record<SectionKey, ReactNode>>

const TIER_TWO = MAIN_NAV.filter((item) => item.tier === 2)

function linkClass(active: boolean): string {
  return cn(
    "relative inline-flex h-full items-center gap-1.5 whitespace-nowrap px-2.5 text-sm font-medium transition-colors duration-150",
    "after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors after:duration-150",
    active
      ? "text-foreground after:bg-primary"
      : "text-muted-foreground after:bg-transparent hover:text-foreground",
  )
}

/**
 * Меню «Ещё» на ширине 1024–1280px: пункты второго уровня, которые на этой
 * ширине не помещаются в строку. С 1280px оно пропадает — всё видно сразу.
 */
function MoreMenu({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false)
  const [seenPath, setSeenPath] = useState(pathname)
  const root = useRef<HTMLDivElement>(null)
  const active = TIER_TWO.some((item) => isSectionActive(item.href, pathname))

  // Переход на другую страницу закрывает меню: состояние сверяем прямо в рендере.
  if (seenPath !== pathname) {
    setSeenPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return

    const onPointer = (event: PointerEvent) => {
      if (root.current !== null && !root.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)

    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative h-full xl:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className={cn(linkClass(active), "cursor-pointer")}
      >
        Ещё
        <ChevronDown
          aria-hidden="true"
          className={cn("size-3.5 transition-transform duration-200", open ? "rotate-180" : undefined)}
        />
      </button>

      {open ? (
        <ul className="absolute right-0 top-full z-50 mt-1.5 flex min-w-52 animate-fade-in flex-col gap-0.5 rounded-control border border-border bg-elevated p-1.5 shadow-overlay">
          {TIER_TWO.map((item) => {
            const current = isSectionActive(item.href, pathname)

            return (
              <li key={item.section}>
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors duration-150",
                    current
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <NavIcon section={item.section} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export type DesktopNavViewProps = {
  pathname: string | null
  badges?: NavBadges
}

export function DesktopNavView({ pathname, badges = {} }: DesktopNavViewProps) {
  return (
    <nav aria-label="Разделы" className="hidden h-full items-stretch lg:flex">
      <ul className="flex h-full items-stretch">
        {MAIN_NAV.map((item) => {
          const active = isSectionActive(item.href, pathname)

          return (
            <li key={item.section} className={cn("h-full", item.tier === 2 ? "hidden xl:block" : undefined)}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={linkClass(active)}
              >
                {item.label}
                {badges[item.section] ?? null}
              </Link>
            </li>
          )
        })}
      </ul>
      <MoreMenu pathname={pathname} />
    </nav>
  )
}

export function DesktopNav({ badges }: { badges?: NavBadges }) {
  const pathname = usePathname()

  return <DesktopNavView pathname={pathname} badges={badges} />
}
