import { toCountry, toSlug } from "@/shared/model"

import { playerHref } from "../lib/playerHref";
import type {
  Player,
  PlayerRef,
  PlayerRole,
  PlayerTeamRef,
} from "../model/player";
import { playerIdSchema, playerRoleSchema } from "../model/player";

import type { PandaPlayerWire } from "./pandaPlayerSchema";

const TEAM_LOGO_PLACEHOLDER = "/team-placeholder.svg";

function toRole(role: string | null): PlayerRole | null {
  const parsed = playerRoleSchema.safeParse(role?.toLowerCase());

  return parsed.success ? parsed.data : null;
}

function toRealName(wire: PandaPlayerWire): string | null {
  const full = [wire.first_name, wire.last_name]
    .filter((part): part is string => part !== null)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(" ");

  return full.length > 0 ? full : null;
}

function toTeam(wire: PandaPlayerWire["current_team"]): PlayerTeamRef | null {
  if (wire === null) return null;

  return {
    id: String(wire.id),
    slug: toSlug(wire.slug),
    name: wire.name,
    shortName: wire.acronym ?? wire.name.slice(0, 4).toUpperCase(),
    logo: {
      url: wire.image_url ?? wire.dark_mode_image_url ?? TEAM_LOGO_PLACEHOLDER,
      width: 64,
      height: 64,
      alt: `Логотип ${wire.name}`,
    },
    darkLogo:
      wire.dark_mode_image_url === null
        ? null
        : {
            url: wire.dark_mode_image_url,
            width: 64,
            height: 64,
            alt: `Логотип ${wire.name}`,
          },
  }
}

export function toPlayerRef(wire: PandaPlayerWire): PlayerRef {
  return {
    id: playerIdSchema.parse(String(wire.id)),
    slug: toSlug(wire.slug),
    nickname: wire.name,
    photo:
      wire.image_url === null
        ? null
        : { url: wire.image_url, width: 200, height: 200, alt: wire.name },
    country: toCountry(wire.nationality),
    role: toRole(wire.role),
  };
}

export function toPlayer(wire: PandaPlayerWire): Player {
  const ref = toPlayerRef(wire);
  const realName = toRealName(wire);

  return {
    id: ref.id,
    slug: ref.slug,
    nickname: ref.nickname,
    realName,
    photo: ref.photo,
    country: ref.country,
    role: ref.role,
    age: wire.age,
    team: toTeam(wire.current_team),
    stats: null,
    achievements: [],
    seo: {
      title: `${ref.nickname}${realName === null ? "" : ` (${realName})`} — профиль игрока CS2`,
      description: `${ref.nickname}: команда, роль, страна и матчи игрока Counter-Strike 2.`,
      canonical: playerHref(ref.slug),
    },
    ref,
  };
}
