"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"

import type { NavItem } from "@/shared/config"
import { Button } from "@/shared/ui/button"

import { ActiveNavItems } from "./ActiveNavItems"

export type MobileNavProps = {
  items: readonly NavItem[]
  label: string
  openLabel: string
  closeLabel: string
  className?: string
}

export function MobileNav({
  items,
  label,
  openLabel,
  closeLabel,
  className,
}: MobileNavProps) {
  const panelId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const close = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", open)

    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    panelRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }

    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, close])

  return (
    <div className={className}>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((previous) => !previous)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </Button>

      {open ? (
        <div className="fixed inset-0 top-header z-40">
          <div
            aria-hidden="true"
            onClick={close}
            className="absolute inset-0 animate-fade-in bg-overlay"
          />
          <div
            ref={panelRef}
            id={panelId}
            tabIndex={-1}
            className="absolute inset-x-0 top-0 max-h-[calc(100dvh-var(--spacing-header))] animate-slide-in-right overflow-y-auto border-b border-border bg-background px-gutter pb-8 pt-4 shadow-overlay"
          >
            <nav aria-label={label} className="flex flex-col gap-1">
              <ActiveNavItems items={items} variant="mobile" onSelect={close} />
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
      className="size-5"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
      className="size-5"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
