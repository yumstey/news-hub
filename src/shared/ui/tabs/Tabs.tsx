"use client"

import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react"
import { useCallback, useId, useMemo, useState } from "react"

import { cn } from "@/shared/lib/style"

import { TabsContext, useTabsContext } from "./TabsContext"
import type { TabsVariant } from "./TabsContext"

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  variant?: TabsVariant
  children: ReactNode
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = "underline",
  className,
  children,
  ...rest
}: TabsProps) {
  const baseId = useId()
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue)
  const current = value ?? internalValue

  const select = useCallback(
    (next: string) => {
      if (value === undefined) setInternalValue(next)
      onValueChange?.(next)
    },
    [value, onValueChange],
  )

  const context = useMemo(
    () => ({ baseId, value: current, variant, select }),
    [baseId, current, variant, select],
  )

  return (
    <TabsContext.Provider value={context}>
      <div className={cn("flex flex-col gap-5", className)} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const listVariantClasses: Record<TabsVariant, string> = {
  underline: "gap-6 border-b border-border",
  pill: "gap-1 rounded-control bg-muted p-1",
}

export type TabListProps = HTMLAttributes<HTMLDivElement>

export function TabList({ className, children, onKeyDown, ...rest }: TabListProps) {
  const { variant } = useTabsContext("TabList")

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)

    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"]
    if (!keys.includes(event.key)) return

    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([disabled])',
      ),
    )
    if (tabs.length === 0) return

    const activeIndex = tabs.findIndex((tab) => tab === document.activeElement)
    const lastIndex = tabs.length - 1

    let nextIndex = activeIndex
    if (event.key === "ArrowRight") nextIndex = activeIndex >= lastIndex ? 0 : activeIndex + 1
    if (event.key === "ArrowLeft") nextIndex = activeIndex <= 0 ? lastIndex : activeIndex - 1
    if (event.key === "Home") nextIndex = 0
    if (event.key === "End") nextIndex = lastIndex

    const nextTab = tabs[nextIndex]
    if (!nextTab) return

    event.preventDefault()
    nextTab.focus()
    nextTab.click()
  }

  return (
    <div
      role="tablist"
      className={cn("flex items-center overflow-x-auto", listVariantClasses[variant], className)}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {children}
    </div>
  )
}

const tabVariantClasses: Record<TabsVariant, { base: string; active: string; idle: string }> = {
  underline: {
    base: "-mb-px border-b-2 px-1 pb-3 pt-2",
    active: "border-primary text-foreground",
    idle: "border-transparent text-muted-foreground hover:text-foreground",
  },
  pill: {
    base: "rounded-[calc(var(--radius-control)-0.25rem)] px-3 py-1.5",
    active: "bg-surface text-foreground shadow-surface",
    idle: "text-muted-foreground hover:text-foreground",
  },
}

export type TabProps = Omit<HTMLAttributes<HTMLButtonElement>, "value"> & {
  value: string
  disabled?: boolean
}

export function Tab({ value, disabled = false, className, children, ...rest }: TabProps) {
  const { baseId, value: current, variant, select } = useTabsContext("Tab")
  const selected = current === value
  const styles = tabVariantClasses[variant]

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-controls={`${baseId}-panel-${value}`}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => select(value)}
      className={cn(
        "shrink-0 whitespace-nowrap text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
        styles.base,
        selected ? styles.active : styles.idle,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export type TabPanelProps = HTMLAttributes<HTMLDivElement> & {
  value: string
}

export function TabPanel({ value, className, children, ...rest }: TabPanelProps) {
  const { baseId, value: current } = useTabsContext("TabPanel")
  const selected = current === value

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={!selected}
      tabIndex={0}
      className={cn(className)}
      {...rest}
    >
      {selected ? children : null}
    </div>
  )
}
