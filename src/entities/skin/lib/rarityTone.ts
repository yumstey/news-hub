import type { SkinCategory, SkinRarity } from "../model/skin"

export type RarityTone = {
  /** Полоса-акцент и точка. */
  bar: string
  text: string
  /** Мягкое свечение за изображением предмета. */
  glow: string
  border: string
  /** Заливка SVG-шкал. */
  fill: string
}

const TONES: Record<SkinRarity | "gold", RarityTone> = {
  consumer: {
    bar: "bg-rarity-consumer",
    fill: "fill-rarity-consumer",
    text: "text-rarity-consumer",
    glow: "from-rarity-consumer/25",
    border: "hover:border-rarity-consumer/60",
  },
  industrial: {
    bar: "bg-rarity-industrial",
    fill: "fill-rarity-industrial",
    text: "text-rarity-industrial",
    glow: "from-rarity-industrial/25",
    border: "hover:border-rarity-industrial/60",
  },
  milspec: {
    bar: "bg-rarity-milspec",
    fill: "fill-rarity-milspec",
    text: "text-rarity-milspec",
    glow: "from-rarity-milspec/25",
    border: "hover:border-rarity-milspec/60",
  },
  restricted: {
    bar: "bg-rarity-restricted",
    fill: "fill-rarity-restricted",
    text: "text-rarity-restricted",
    glow: "from-rarity-restricted/25",
    border: "hover:border-rarity-restricted/60",
  },
  classified: {
    bar: "bg-rarity-classified",
    fill: "fill-rarity-classified",
    text: "text-rarity-classified",
    glow: "from-rarity-classified/25",
    border: "hover:border-rarity-classified/60",
  },
  covert: {
    bar: "bg-rarity-covert",
    fill: "fill-rarity-covert",
    text: "text-rarity-covert",
    glow: "from-rarity-covert/25",
    border: "hover:border-rarity-covert/60",
  },
  extraordinary: {
    bar: "bg-rarity-gold",
    fill: "fill-rarity-gold",
    text: "text-rarity-gold",
    glow: "from-rarity-gold/25",
    border: "hover:border-rarity-gold/60",
  },
  contraband: {
    bar: "bg-rarity-gold",
    fill: "fill-rarity-gold",
    text: "text-rarity-gold",
    glow: "from-rarity-gold/25",
    border: "hover:border-rarity-gold/60",
  },
  gold: {
    bar: "bg-rarity-gold",
    fill: "fill-rarity-gold",
    text: "text-rarity-gold",
    glow: "from-rarity-gold/25",
    border: "hover:border-rarity-gold/60",
  },
}

/** Ножи и перчатки в игре подсвечены золотом независимо от редкости. */
export function rarityTone(rarity: SkinRarity, category?: SkinCategory): RarityTone {
  if (category === "knives" || category === "gloves") return TONES.gold

  return TONES[rarity]
}
