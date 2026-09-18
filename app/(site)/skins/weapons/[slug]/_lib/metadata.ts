import { formatUsd, getSkinWeapons, weaponHref } from "@/entities/skin"
import { pluralize } from "@/shared/lib/text"
import { slugSchema } from "@/shared/model"

import { buildMetadata, NOT_FOUND_METADATA } from "../../../../_lib/metadata"

export async function generateMetadata(props: PageProps<"/skins/weapons/[slug]">) {
  const { slug } = await props.params
  const parsed = slugSchema.safeParse(slug)

  if (!parsed.success) return NOT_FOUND_METADATA

  const result = await getSkinWeapons()
  const weapon = result.ok ? result.data.find((entry) => entry.slug === parsed.data) : undefined

  if (weapon === undefined) return NOT_FOUND_METADATA

  const params = await props.searchParams
  const filtered = Object.keys(params).some((key) => key !== "page")
  const price = weapon.fromPrice === null ? "" : `, цены от ${formatUsd(weapon.fromPrice)}`

  return buildMetadata(
    `Скины на ${weapon.name} в CS2 — все раскраски и цены`,
    `${pluralize(weapon.count, ["скин", "скина", "скинов"])} на ${weapon.name}${price}. Редкость, износ, StatTrak™ и где купить дешевле — каталог раскрасок ${weapon.name} для Counter-Strike 2.`,
    weaponHref(weapon.slug),
    {
      noindex: filtered,
      keywords: [`скины на ${weapon.name}`, `${weapon.name} скины cs2`, `${weapon.name} кс2`],
    },
  )
}
