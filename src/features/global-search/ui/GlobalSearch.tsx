"use client"

import { Search, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useId, useState } from "react"
import type { FormEvent } from "react"

import { cn } from "@/shared/lib/style"

export type GlobalSearchProps = {
  className?: string
  autoFocus?: boolean
  /** Вызывается после перехода к результатам — диалог поиска закрывает себя. */
  onSubmitted?: () => void
  size?: "md" | "lg"
}

export function GlobalSearch({ className, autoFocus = false, onSubmitted, size = "md" }: GlobalSearchProps) {
  const router = useRouter()
  const params = useSearchParams()
  const inputId = useId()
  const [value, setValue] = useState(params.get("q") ?? "")

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const query = value.trim()

    if (query.length === 0) return

    router.push(`/search?q=${encodeURIComponent(query)}`)
    onSubmitted?.()
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={cn("relative flex items-center", className)}
    >
      <label htmlFor={inputId} className="sr-only">
        Поиск по командам, игрокам, турнирам и скинам
      </label>
      <Search
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-3 text-subtle-foreground",
          size === "lg" ? "size-5" : "size-4",
        )}
      />
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Команды, игроки, турниры, скины"
        autoComplete="off"
        autoFocus={autoFocus}
        enterKeyHint="search"
        className={cn(
          "w-full rounded-control border border-border bg-surface pr-9 text-foreground placeholder:text-subtle-foreground focus-visible:border-border-strong",
          size === "lg" ? "h-12 pl-11 text-base" : "h-10 pl-9 text-sm",
        )}
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-2 inline-flex size-6 items-center justify-center rounded-sm text-subtle-foreground transition-colors duration-150 hover:text-foreground"
        >
          <X aria-hidden="true" className="size-4" />
          <span className="sr-only">Очистить</span>
        </button>
      ) : null}
    </form>
  )
}
