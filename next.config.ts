import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  typedRoutes: true,
  reactStrictMode: true,
  poweredByHeader: false,
  cacheLife: {
    article: {
      stale: 300,
      revalidate: 900,
      expire: 86400,
    },
    feed: {
      stale: 60,
      revalidate: 120,
      expire: 3600,
    },
    reference: {
      stale: 3600,
      revalidate: 21600,
      expire: 604800,
    },
    schedule: {
      stale: 60,
      revalidate: 300,
      expire: 86400,
    },
    // Цены скинов: Skinport сам обновляет выгрузку раз в несколько минут и
    // ограничивает частоту запросов, поэтому полчаса — разумный компромисс.
    prices: {
      stale: 300,
      revalidate: 1800,
      expire: 86400,
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Картинки с CDN (скины, логотипы, скриншоты Steam) по одному адресу не меняются —
    // держим оптимизированные копии неделю вместо 4 часов по умолчанию.
    minimumCacheTTL: 604800,
    qualities: [50, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn-api.pandascore.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img-cdn.hltv.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.pcgamesn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.cybersport.ru",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "media.esports.gg",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "www.dexerto.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "community.akamai.steamstatic.com",
        pathname: "/economy/image/**",
      },
      {
        protocol: "https",
        hostname: "community.cloudflare.steamstatic.com",
        pathname: "/economy/image/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/ByMykel/**",
      },
      {
        protocol: "https",
        hostname: "clan.akamai.steamstatic.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "clan.fastly.steamstatic.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "shared.akamai.steamstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.akamai.steamstatic.com",
        pathname: "/steam/apps/**",
      },
      {
        protocol: "https",
        hostname: "static-cdn.jtvnw.net",
        pathname: "/previews-ttv/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/commons/**",
      },
      {
        // Миниатюры Commons с 2026 года отдаются с отдельного домена.
        protocol: "https",
        hostname: "thumb.wikimedia.org",
        pathname: "/wikipedia/commons/**",
      },
    ],
  },
};

export default nextConfig;
