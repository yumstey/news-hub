export type AdSlotName = "sidebar" | "inline"

export type AdCreative = {
  id: string
  partner: string
  href: string
  headline: string
  subline: string
  cta: string
  gambling: boolean
}

export const ADS_ENABLED = false

export const AD_DISCLOSURE = "Реклама"

export const AD_GAMBLING_NOTICE = "18+"

export const AD_SLOTS: Record<AdSlotName, AdCreative | null> = {
  sidebar: {
    id: "1xbet-sidebar",
    partner: "1xBet",
    href: "https://1xbet.com/",
    headline: "Ставки на CS2",
    subline: "Коэффициенты на матчи Counter-Strike 2 и киберспортивные турниры.",
    cta: "Перейти",
    gambling: true,
  },
  inline: {
    id: "1xbet-inline",
    partner: "1xBet",
    href: "https://1xbet.com/",
    headline: "Ставки на матчи CS2",
    subline: "Линия на ближайшие игры и турниры.",
    cta: "Перейти",
    gambling: true,
  },
}

export function adCreative(slot: AdSlotName): AdCreative | null {
  return ADS_ENABLED ? AD_SLOTS[slot] : null
}
