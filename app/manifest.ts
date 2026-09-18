import type { MetadataRoute } from "next"

import { CS2, SITE } from "@/shared/config"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — матчи, статистика и скины`,
    short_name: SITE.shortName,
    description: SITE.description,
    lang: "ru",
    start_url: "/",
    display: "standalone",
    background_color: "#14161f",
    theme_color: "#14161f",
    categories: ["sports", "games", "entertainment"],
    icons: [
      { src: CS2.logo.url, sizes: `${CS2.logo.width}x${CS2.logo.height}`, type: "image/jpeg" },
    ],
  }
}
