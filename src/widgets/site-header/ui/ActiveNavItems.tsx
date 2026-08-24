"use client"

import { usePathname } from "next/navigation"

import type { NavItem } from "@/shared/config"

import { NavItems } from "./NavItems"

export type ActiveNavItemsProps = {
  items: readonly NavItem[]
  variant?: "desktop" | "mobile"
  onSelect?: () => void
}

export function ActiveNavItems({ items, variant, onSelect }: ActiveNavItemsProps) {
  const pathname = usePathname()

  return <NavItems items={items} pathname={pathname} variant={variant} onSelect={onSelect} />
}
