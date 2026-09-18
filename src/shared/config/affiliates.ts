import { PUBLIC_ENV } from "./env"

export type MarketPartner = "skinport" | "csfloat" | "steam"

type PartnerConfig = {
  name: string
  /** Реферальный код; пустая строка — ссылка без партнёрской метки. */
  ref: string
  param: string
}

const PARTNERS: Record<MarketPartner, PartnerConfig> = {
  skinport: { name: "Skinport", ref: PUBLIC_ENV.NEXT_PUBLIC_SKINPORT_REF, param: "r" },
  csfloat: { name: "CSFloat", ref: PUBLIC_ENV.NEXT_PUBLIC_CSFLOAT_REF, param: "ref" },
  steam: { name: "Steam Маркет", ref: "", param: "" },
}

export const AFFILIATE_DISCLOSURE =
  "Ссылки на маркетплейсы могут быть партнёрскими: при покупке сайт получает комиссию, цена для вас не меняется."

export function partnerName(partner: MarketPartner): string {
  return PARTNERS[partner].name
}

export function isAffiliate(partner: MarketPartner): boolean {
  return PARTNERS[partner].ref.length > 0
}

function withRef(partner: MarketPartner, url: string): string {
  const config = PARTNERS[partner]

  if (config.ref.length === 0) return url

  try {
    const parsed = new URL(url)

    parsed.searchParams.set(config.param, config.ref)

    return parsed.toString()
  } catch {
    return url
  }
}

/** Ссылка на предмет в маркетплейсе с партнёрской меткой, если она настроена. */
export function marketUrl(partner: MarketPartner, marketHashName: string, itemPage?: string): string {
  const name = encodeURIComponent(marketHashName)

  switch (partner) {
    case "skinport":
      return withRef(partner, itemPage ?? `https://skinport.com/market?search=${name}`)
    case "csfloat":
      return withRef(partner, `https://csfloat.com/search?market_hash_name=${name}`)
    case "steam":
      return `https://steamcommunity.com/market/listings/730/${name}`
  }
}
