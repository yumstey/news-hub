export type GameMap = {
  id: string
  slug: string
  name: string
  image: string | null
}

/** Карты активного пула CS2 — по ним строится порядок в подборках. */
export const ACTIVE_DUTY: readonly string[] = [
  "mirage",
  "inferno",
  "nuke",
  "ancient",
  "dust2",
  "train",
  "overpass",
  "anubis",
  "vertigo",
]
