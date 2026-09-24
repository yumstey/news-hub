import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { DEFAULT_OG_IMAGE, PUBLIC_ENV, SITE, SITE_URL } from "@/shared/config"

import "@/app/styles/global.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE.name,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "cs2",
    "кс2",
    "counter-strike 2",
    "матчи cs2",
    "результаты cs2",
    "скины cs2",
    "кейсы cs2",
    "обновление cs2",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    ...(PUBLIC_ENV.NEXT_PUBLIC_GOOGLE_VERIFICATION.length === 0
      ? {}
      : { google: PUBLIC_ENV.NEXT_PUBLIC_GOOGLE_VERIFICATION }),
    ...(PUBLIC_ENV.NEXT_PUBLIC_YANDEX_VERIFICATION.length === 0
      ? {}
      : { yandex: PUBLIC_ENV.NEXT_PUBLIC_YANDEX_VERIFICATION }),
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "ru_RU",
    title: SITE.name,
    description: SITE.description,
    url: "/",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
    images: [DEFAULT_OG_IMAGE.url],
  },
}

/**
 * Выбранная тема применяется до первой отрисовки: иначе страница успевает
 * мигнуть системной темой. Без сохранённого выбора тема следует системе.
 */
const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}`

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={SITE.locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
