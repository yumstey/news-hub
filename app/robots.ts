import type { MetadataRoute } from "next"

import { SITE_URL, SITEMAP_SECTIONS } from "@/shared/config"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Поиск и отфильтрованные выдачи — дубли каталога без собственной ценности.
        disallow: ["/search", "/*?*q=", "/api/"],
      },
    ],
    sitemap: SITEMAP_SECTIONS.map((id) => `${SITE_URL}/sitemap/${id}.xml`),
    host: SITE_URL,
  }
}
