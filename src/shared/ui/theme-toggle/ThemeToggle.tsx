"use client"

import { Moon, Sun } from "lucide-react"
import { useSyncExternalStore } from "react"

import { cn } from "@/shared/lib/style"

export type Theme = "light" | "dark"

/** Ключ в localStorage читает и инлайн-скрипт в layout — темы меняются до отрисовки. */
export const THEME_STORAGE_KEY = "theme"
const THEME_EVENT = "themechange"

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)")

  // storage — переключение в соседней вкладке, themechange — в этой же.
  window.addEventListener("storage", onChange)
  window.addEventListener(THEME_EVENT, onChange)
  media.addEventListener("change", onChange)

  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(THEME_EVENT, onChange)
    media.removeEventListener("change", onChange)
  }
}

function activeTheme(): Theme {
  const chosen = document.documentElement.dataset.theme

  if (chosen === "light" || chosen === "dark") return chosen

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export type ThemeToggleProps = {
  /** "labelled" — с подписью, для меню на телефоне. */
  variant?: "icon" | "labelled"
  className?: string
}

/**
 * Переключатель темы. Пока зритель не выбрал сам, тема следует настройке
 * системы; выбор запоминается в localStorage и применяется до первой отрисовки.
 */
export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribe, activeTheme, (): Theme => "dark")
  const next: Theme = theme === "dark" ? "light" : "dark"
  const label = next === "dark" ? "Включить тёмную тему" : "Включить светлую тему"

  const apply = (): void => {
    document.documentElement.dataset.theme = next

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Приватный режим: тема останется до перезагрузки страницы.
    }

    window.dispatchEvent(new Event(THEME_EVENT))
  }

  const Icon = theme === "dark" ? Sun : Moon

  if (variant === "labelled") {
    return (
      <button
        type="button"
        onClick={apply}
        className={cn(
          "flex min-h-11 w-full items-center gap-2.5 rounded-control border border-border bg-surface px-3 text-sm font-medium text-foreground",
          "transition-colors duration-150 hover:border-border-strong hover:bg-muted",
          className,
        )}
      >
        <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
        {next === "dark" ? "Тёмная тема" : "Светлая тема"}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={apply}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-control border border-border bg-surface text-muted-foreground",
        "transition-colors duration-150 hover:border-border-strong hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
    </button>
  )
}
