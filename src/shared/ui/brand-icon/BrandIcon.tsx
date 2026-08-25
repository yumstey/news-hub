import {
  siDiscord,
  siFacebook,
  siInstagram,
  siTelegram,
  siTwitch,
  siVk,
  siX,
  siYoutube,
} from "simple-icons"

import { cn } from "@/shared/lib/style"

export type BrandKey =
  | "x"
  | "instagram"
  | "youtube"
  | "telegram"
  | "twitch"
  | "facebook"
  | "vk"
  | "discord"

type Brand = { title: string; hex: string; path: string }

const BRANDS: Record<BrandKey, Brand> = {
  x: siX,
  instagram: siInstagram,
  youtube: siYoutube,
  telegram: siTelegram,
  twitch: siTwitch,
  facebook: siFacebook,
  vk: siVk,
  discord: siDiscord,
}

export function brandColor(key: BrandKey): string {
  return `#${BRANDS[key].hex}`
}

export function brandTitle(key: BrandKey): string {
  return BRANDS[key].title
}

export type BrandIconProps = {
  brand: BrandKey
  className?: string
}

export function BrandIcon({ brand, className }: BrandIconProps) {
  return (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-4", className)}
    >
      <path d={BRANDS[brand].path} />
    </svg>
  )
}
