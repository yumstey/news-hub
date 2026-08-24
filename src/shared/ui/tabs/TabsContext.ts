"use client"

import { createContext, useContext } from "react"

export type TabsVariant = "underline" | "pill"

export type TabsContextValue = {
  readonly baseId: string
  readonly value: string | undefined
  readonly variant: TabsVariant
  readonly select: (next: string) => void
}

export const TabsContext = createContext<TabsContextValue | null>(null)

export function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext)

  if (!context) {
    throw new Error(`${component} must be rendered inside <Tabs>`)
  }

  return context
}
