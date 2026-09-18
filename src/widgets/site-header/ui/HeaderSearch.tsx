"use client"

import { Search } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { GlobalSearch } from "@/features/global-search"
import { ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib/style"

const QUICK = [
  { label: "Матчи сегодня", href: ROUTES.matches },
  { label: "Рейтинг команд", href: ROUTES.rankings },
  { label: "Цены скинов", href: ROUTES.skins },
  { label: "Кейсы и шансы", href: ROUTES.cases },
] as const

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
}

/**
 * Поиск в шапке — кнопка, открывающая модальный диалог. Поле в строке
 * съедало треть шапки; так меню помещается в одну строку. Клавиша «/» —
 * быстрый вызов, как на GitHub и HLTV.
 */
export function HeaderSearch({ className }: { className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  // Поле монтируется заново при каждом открытии — так срабатывает autoFocus.
  const [session, setSession] = useState(0)

  const open = () => {
    setSession((value) => value + 1)
    dialog.current?.showModal()
  }
  const close = () => dialog.current?.close()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || isTyping(event.target)) return

      event.preventDefault()
      setSession((value) => value + 1)
      dialog.current?.showModal()
    }

    document.addEventListener("keydown", onKey)

    return () => document.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-control border border-border bg-surface/60 px-2.5 text-sm text-subtle-foreground transition-colors duration-150 hover:border-border-strong hover:text-foreground",
          className,
        )}
      >
        <Search aria-hidden="true" className="size-4" />
        <span className="hidden 2xl:inline">Поиск</span>
        <kbd className="hidden rounded-xs border border-border px-1.5 font-mono text-overline text-subtle-foreground xl:inline">
          /
        </kbd>
        <span className="sr-only">Открыть поиск</span>
      </button>

      <dialog
        ref={dialog}
        aria-label="Поиск"
        onClick={(event) => {
          if (event.target === dialog.current) close()
        }}
        className="m-0 mx-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] max-w-none rounded-surface border border-border bg-elevated p-0 text-foreground shadow-overlay backdrop:bg-overlay backdrop:backdrop-blur-sm open:animate-rise-in"
      >
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          {session === 0 ? null : (
            <GlobalSearch key={session} size="lg" autoFocus onSubmitted={close} />
          )}

          <div className="flex flex-col gap-2">
            <span className="text-overline uppercase text-subtle-foreground">Популярное</span>
            <ul className="flex flex-wrap gap-2">
              {QUICK.map((entry) => (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    onClick={close}
                    className="inline-flex h-8 items-center rounded-full border border-border px-3 text-caption text-muted-foreground transition-colors duration-150 hover:border-primary/40 hover:text-primary"
                  >
                    {entry.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <p className="hidden text-caption text-subtle-foreground sm:block">
            <kbd className="rounded-xs border border-border px-1.5 font-mono">Esc</kbd> — закрыть
          </p>
        </div>
      </dialog>
    </>
  )
}
