import type { MetadataRoute } from "next"

import { crateHref, getCrateCatalog } from "@/entities/crate"
import { getGameUpdates, updateHref } from "@/entities/game-update"
import { getPlayers, playerHref } from "@/entities/player"
import { getSkinCatalog, getSkinWeapons, skinHref, weaponHref } from "@/entities/skin"
import { getTeams, teamHref } from "@/entities/team"
import { getTournaments, tournamentHref } from "@/entities/tournament"
import { ROUTES, SITE_URL, SITEMAP_SECTIONS } from "@/shared/config"
import type { SitemapSection } from "@/shared/config"

export function generateSitemaps() {
  return SITEMAP_SECTIONS.map((id) => ({ id }))
}

function absolute(path: string): string {
  return new URL(path, SITE_URL).toString()
}

async function pages(): Promise<MetadataRoute.Sitemap> {
  const hubs: { path: string; priority: number; frequency: "hourly" | "daily" | "weekly" }[] = [
    { path: ROUTES.home, priority: 1, frequency: "hourly" },
    { path: ROUTES.matches, priority: 0.9, frequency: "hourly" },
    { path: ROUTES.results, priority: 0.9, frequency: "hourly" },
    { path: ROUTES.skins, priority: 0.9, frequency: "daily" },
    { path: ROUTES.cases, priority: 0.8, frequency: "daily" },
    { path: ROUTES.events, priority: 0.8, frequency: "daily" },
    { path: ROUTES.rankings, priority: 0.8, frequency: "weekly" },
    { path: ROUTES.updates, priority: 0.8, frequency: "daily" },
    { path: ROUTES.game, priority: 0.8, frequency: "daily" },
    { path: ROUTES.teams, priority: 0.7, frequency: "daily" },
    { path: ROUTES.players, priority: 0.7, frequency: "daily" },
    { path: ROUTES.news, priority: 0.7, frequency: "hourly" },
    { path: ROUTES.streams, priority: 0.6, frequency: "hourly" },
    { path: ROUTES.advertise, priority: 0.3, frequency: "weekly" },
  ]

  return hubs.map((hub) => ({
    url: absolute(hub.path),
    changeFrequency: hub.frequency,
    priority: hub.priority,
  }))
}

async function skins(): Promise<MetadataRoute.Sitemap> {
  const [catalog, weapons] = await Promise.all([getSkinCatalog(), getSkinWeapons()])

  return [
    ...(weapons.ok ? weapons.data : []).map((weapon) => ({
      url: absolute(weaponHref(weapon.slug)),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...(catalog.ok ? catalog.data : []).map((skin) => ({
      url: absolute(skinHref(skin.slug)),
      changeFrequency: "daily" as const,
      // Ходовые скины ищут чаще — подсказываем роботу, с чего начать обход.
      priority: skin.listings > 100 ? 0.7 : 0.5,
      ...(skin.image === null ? {} : { images: [skin.image] }),
    })),
  ]
}

async function cases(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCrateCatalog()

  return (catalog.ok ? catalog.data : []).map((crate) => ({
    url: absolute(crateHref(crate.slug)),
    changeFrequency: "daily" as const,
    priority: 0.7,
    ...(crate.image === null ? {} : { images: [crate.image] }),
  }))
}

async function updates(): Promise<MetadataRoute.Sitemap> {
  const list = await getGameUpdates()

  return (list.ok ? list.data : []).map((update) => ({
    url: absolute(updateHref(update.slug)),
    lastModified: update.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))
}

async function esports(): Promise<MetadataRoute.Sitemap> {
  const [teams, players, events] = await Promise.all([getTeams(), getPlayers(), getTournaments()])

  return [
    ...(events.ok ? events.data : []).map((event) => ({
      url: absolute(tournamentHref(event.slug)),
      lastModified: event.endsAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...(teams.ok ? teams.data : []).map((team) => ({
      url: absolute(teamHref(team.slug)),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...(players.ok ? players.data : []).map((player) => ({
      url: absolute(playerHref(player.slug)),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ]
}

const BUILDERS: Record<SitemapSection, () => Promise<MetadataRoute.Sitemap>> = {
  pages,
  skins,
  cases,
  updates,
  esports,
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = await props.id
  const build = BUILDERS[id as SitemapSection]

  return build === undefined ? [] : build()
}
