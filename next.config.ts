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
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
