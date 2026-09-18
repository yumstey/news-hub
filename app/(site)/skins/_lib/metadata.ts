import { ROUTES } from "@/shared/config"

import { buildMetadata } from "../../_lib/metadata"

export const SKINS_TITLE = "Скины CS2: цены и каталог"
export const SKINS_DESCRIPTION =
  "Все скины Counter-Strike 2 с актуальными ценами: ножи, перчатки, AK-47, AWP и M4. Цены по износу, StatTrak™, диапазон float, кейсы и коллекции."

export async function generateMetadata(props: PageProps<"/skins">) {
  const params = await props.searchParams
  // Отфильтрованные выдачи дублируют каталог — в индекс идёт только чистый адрес.
  const filtered = Object.keys(params).some((key) => key !== "page")

  return buildMetadata(SKINS_TITLE, SKINS_DESCRIPTION, ROUTES.skins, {
    noindex: filtered,
    keywords: ["скины cs2", "цены скинов кс2", "скины кс2", "ножи cs2", "перчатки cs2"],
  })
}
