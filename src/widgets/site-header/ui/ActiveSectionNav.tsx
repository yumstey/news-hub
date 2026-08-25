"use client"

import { usePathname } from "next/navigation"

import { SectionNavItems } from "./SectionNavItems"

export function ActiveSectionNav({ onSelect }: { onSelect?: () => void }) {
  const pathname = usePathname()

  return <SectionNavItems pathname={pathname} onSelect={onSelect} />
}
