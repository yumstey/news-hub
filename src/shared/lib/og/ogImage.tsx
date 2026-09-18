import "server-only"

import { ImageResponse } from "next/og"

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = "image/png"

const FONT_CSS = "https://fonts.googleapis.com/css2?family=Geist:wght@"

const fonts = new Map<number, Promise<ArrayBuffer | null>>()

/**
 * Шрифт по умолчанию в ImageResponse не содержит кириллицы. Google Fonts для
 * небраузерного клиента отдаёт один TTF со всеми глифами — грузим его один раз
 * на экземпляр сервера.
 */
function font(weight: 500 | 700): Promise<ArrayBuffer | null> {
  const cached = fonts.get(weight)

  if (cached !== undefined) return cached

  const pending = (async () => {
    try {
      const css = await (await fetch(`${FONT_CSS}${weight}`)).text()
      const url = /src: url\((.+?)\) format\('(?:truetype|opentype)'\)/.exec(css)?.[1]

      if (url === undefined) return null

      return await (await fetch(url)).arrayBuffer()
    } catch {
      return null
    }
  })()

  fonts.set(weight, pending)

  return pending
}

export type OgCard = {
  eyebrow: string
  title: string
  subtitle?: string
  /** Крупная картинка справа: скин, кейс или логотип. */
  image?: string | null
  /** Акцентный цвет полосы и свечения, hex. */
  accent?: string
  /** Плашка внизу: цена, счёт, дата. */
  badge?: string
  /** Две картинки через «vs» — для матчей. */
  versus?: { left: string | null; right: string | null; score: string | null }
}

const BRAND = "CS2"

/** Логотипы команд часто тёмные — кладём их на светлую подложку, как на HLTV. */
function Logo({ src, size }: { src: string | null; size: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size,
        background: "#eef0fa",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
      }}
    >
      {src === null ? null : (
        // eslint-disable-next-line @next/next/no-img-element -- ImageResponse рендерит только <img>
        <img src={src} width={size * 0.66} height={size * 0.66} style={{ objectFit: "contain" }} alt="" />
      )}
    </div>
  )
}

export async function ogImageResponse(card: OgCard): Promise<ImageResponse> {
  const [medium, bold] = await Promise.all([font(500), font(700)])
  const accent = card.accent ?? "#6d7dff"
  const title = card.title.length > 70 ? `${card.title.slice(0, 68)}…` : card.title

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(135deg, #0d1020 0%, #161a2e 55%, #1d2340 100%)",
          fontFamily: "Geist",
          color: "#f2f4ff",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -140,
            width: 620,
            height: 620,
            borderRadius: 620,
            background: `radial-gradient(circle, ${accent}55 0%, ${accent}00 70%)`,
          }}
        />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 12, background: accent }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            width: card.image || card.versus ? 700 : 1100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 14, height: 14, borderRadius: 14, background: accent }} />
            <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: 4, color: "#a9b0d6", whiteSpace: "nowrap" }}>
              {`${BRAND} · ${card.eyebrow.toUpperCase()}`}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: title.length > 40 ? 58 : 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5 }}>
              {title}
            </div>
            {card.subtitle === undefined ? null : (
              <div style={{ fontSize: 30, fontWeight: 500, color: "#b8bee0", lineHeight: 1.3 }}>
                {card.subtitle}
              </div>
            )}
          </div>

          {card.badge === undefined ? (
            <div style={{ display: "flex" }} />
          ) : (
            <div style={{ display: "flex" }}>
              <div
                style={{
                  display: "flex",
                  padding: "12px 26px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.08)",
                  border: `2px solid ${accent}`,
                  fontSize: 36,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {card.badge}
              </div>
            </div>
          )}
        </div>

        {card.versus === undefined ? null : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, width: 480, paddingRight: 20 }}>
            <Logo src={card.versus.left} size={150} />
            <div style={{ fontSize: card.versus.score === null ? 44 : 64, fontWeight: 700, color: "#ffffff" }}>
              {card.versus.score ?? "VS"}
            </div>
            <Logo src={card.versus.right} size={150} />
          </div>
        )}

        {card.image == null || card.versus !== undefined ? null : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 500, paddingRight: 40 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse рендерит только <img> */}
            <img src={card.image} width={460} height={345} style={{ objectFit: "contain" }} alt="" />
          </div>
        )}
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        ...(medium === null ? [] : [{ name: "Geist", data: medium, weight: 500 as const, style: "normal" as const }]),
        ...(bold === null ? [] : [{ name: "Geist", data: bold, weight: 700 as const, style: "normal" as const }]),
      ],
    },
  )
}
