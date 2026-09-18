import { crateHref, getCrateBySlug } from "@/entities/crate"
import { formatUsd } from "@/entities/skin"
import { slugSchema } from "@/shared/model"

import { buildMetadata, NOT_FOUND_METADATA } from "../../../_lib/metadata"

export async function generateMetadata(props: PageProps<"/cases/[slug]">) {
  const { slug } = await props.params
  const parsed = slugSchema.safeParse(slug)

  if (!parsed.success) return NOT_FOUND_METADATA

  const result = await getCrateBySlug(parsed.data)

  if (!result.ok) return NOT_FOUND_METADATA

  const crate = result.data
  const price = crate.price === null ? "" : `, цена ${formatUsd(crate.price)}`
  const rare = crate.rareLabel === null ? "нож или перчатки" : `редкий предмет ${crate.rareLabel}`

  return buildMetadata(
    `${crate.name}: что выпадает, шансы и цена`,
    `Что выпадает из ${crate.name}: ${crate.itemCount} скинов и ${rare}. Шансы по редкостям${price}, стоимость открытия с ключом и оценка окупаемости.`,
    crateHref(crate.slug),
    { image: "file", keywords: [`${crate.name}`, `${crate.name} что выпадает`, `${crate.name} цена`, "кейсы cs2"] },
  )
}
