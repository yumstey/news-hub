import type { VideoChannel } from "../model/video"

/**
 * Официальные каналы турнирных операторов и HLTV. У каждого канала YouTube
 * есть открытая RSS-лента последних 15 роликов — без ключа и квот API.
 */
export const VIDEO_CHANNELS: readonly VideoChannel[] = [
  { id: "UCbWA4nLSXvfWnOS2Q4yP48A", handle: "BLASTPremierHighlights", name: "BLAST Premier CS2 Highlights", label: "BLAST" },
  { id: "UCDQZcZZwv-RhxHxJpHCdmbQ", handle: "ESLCSHighlights", name: "ESL Counter-Strike Highlights", label: "ESL" },
  { id: "UCXbsUubmNPK8XJFbkmlMcMg", handle: "HLTVorg", name: "HLTV", label: "HLTV" },
  { id: "UC9k--dE_UE0Faxzgb_DDkYQ", handle: "BLASTPremier", name: "BLAST Premier", label: "BLAST" },
  { id: "UCPq2ETz4aAGo2Z-8JisDPIA", handle: "ESLCS", name: "ESL Counter-Strike", label: "ESL" },
]

export function feedUrl(channel: VideoChannel): string {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`
}

export function channelUrl(channel: VideoChannel): string {
  return `https://www.youtube.com/@${channel.handle}`
}
