import type { CareerEvent } from "../api/getPlayerCareer"

/**
 * Турнир считается титулом игрока, если его выиграла команда, за которую он
 * выходил в этот период (составы восстанавливаются по матчам игрока).
 */
export function isTitle(event: CareerEvent, teamIds: readonly string[]): boolean {
  return event.winnerId !== null && teamIds.includes(event.winnerId)
}

export function countTitles(
  events: readonly CareerEvent[],
  teamIds: readonly string[],
): number {
  return events.filter((event) => isTitle(event, teamIds)).length
}
