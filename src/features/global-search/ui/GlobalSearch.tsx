"use client"

import { Search, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useId, useState } from "react"
import type { FormEvent } from "react"

import { cn } from "@/shared/lib/style"

export type GlobalSearchProps = {
  className?: string
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const router = useRouter()
  const params = useSearchParams()
  const inputId = useId()
  const [value, setValue] = useState(params.get("q") ?? "")

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const query = value.trim()

    if (query.length === 0) return

    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={cn("relative flex items-center", className)}
    >
      <label htmlFor={inputId} className="sr-only">
        Поиск по командам, игрокам и турнирам
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 size-4 text-subtle-foreground"
      />
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Команды, игроки, турниры"
        autoComplete="off"
        className="h-10 w-full rounded-control border border-border bg-surface pl-9 pr-9 text-sm text-foreground placeholder:text-subtle-foreground focus-visible:border-border-strong"
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
