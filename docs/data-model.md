# Data model

Domain shapes and the contract rules around them. No implementation — this is the specification the `entities` layer will satisfy.

## 1. Rules

1. **Zod is the source of truth.** A schema is declared first; the TypeScript type is derived with `z.infer`. Types are never hand-written alongside a schema — they drift.
2. **Parse at the boundary.** Every payload entering the process is parsed before use. Inside the application, a value of a domain type is already valid.
3. **No `any`.** Unknown input is typed `unknown` and narrowed by parsing. `any` is an ESLint error.
4. **Wire shape and domain shape are separate.** The API's shape is not the application's shape. A `mapper` in `entities/*/model` converts one to the other, so a backend rename touches one file.
5. **Dates cross the wire as ISO strings and become `Date` in the domain.** Server Components can pass `Date` to Client Components without serialisation loss.
6. **IDs are branded.** `ArticleId` is not assignable from `TeamId`, so mixed-up identifiers fail at compile time rather than in a query.

## 2. Shared primitives

Defined in `shared/model` and `shared/api`, referenced by every entity.

| Type | Shape | Notes |
| --- | --- | --- |
| `Slug` | branded `string` | URL segment; validated `^[a-z0-9-]+$` |
| `EntityId` | branded `string` | Base for `ArticleId`, `MatchId`, … |
| `LocaleCode` | enum | `uz` \| `ru` \| `en` |
| `ImageAsset` | `{ url, width, height, alt, blurDataUrl? }` | Width and height required — the layout reserves space, so no CLS |
| `SeoFields` | `{ title, description, canonical, ogImage? }` | Every publishable entity carries this |
| `Paginated<T>` | `{ items: T[], page, perPage, total, hasNext }` | Uniform envelope for every list |
| `Timestamps` | `{ createdAt, updatedAt, publishedAt? }` | `Date` after mapping |

`Paginated<T>` is uniform on purpose: `feed-pagination` is one feature, not one per list.

## 3. Content module

### 3.1 `Article`

The central model. One type across News and Sport (see [modules.md](./modules.md) §6).

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `ArticleId` | |
| `slug` | `Slug` | Unique within `module` |
| `module` | `ContentModule` | `news` \| `sport` \| `esports` |
| `discipline` | `DisciplineRef \| null` | Set when `module` is `sport` or `esports` |
| `title` | `string` | |
| `excerpt` | `string` | Feeds and meta description fallback |
| `body` | `RichContent` | §3.4 |
| `cover` | `ImageAsset` | Required — OG image and feed card both need it |
| `author` | `AuthorRef` | |
| `categories` | `CategoryRef[]` | |
| `tags` | `string[]` | |
| `readingMinutes` | `number` | Derived at map time |
| `seo` | `SeoFields` | |
| `timestamps` | `Timestamps` | `publishedAt` drives sitemap `lastModified` |

`module` and `discipline` are what route an article. The URL is derived from them, not stored, so one function owns the article-to-URL mapping.

### 3.2 `Category`

`id`, `slug`, `module`, `title`, `description`, `parent: CategoryRef | null`, `seo`.

Self-referencing parent supports a two-level taxonomy without a separate type. Depth is capped at two in validation — deeper trees produce breadcrumbs nobody wants.

### 3.3 `Author`

`id`, `slug`, `name`, `avatar: ImageAsset | null`, `bio`, `socials: SocialLink[]`.

Feeds the `NewsArticle.author` JSON-LD node and author pages if they are added.

### 3.4 `RichContent`

Article bodies are a discriminated union of blocks, not an HTML string:

```
type ContentBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; level: 2 | 3; text: string }
  | { kind: 'image'; asset: ImageAsset; caption?: string }
  | { kind: 'embed'; provider: EmbedProvider; url: string }
  | { kind: 'quote'; text: string; attribution?: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'match-ref'; matchId: MatchId }
```

Reasons: no `dangerouslySetInnerHTML` on editorial content, so no XSS surface from the CMS; images get width and height so layout is stable; embeds become Client Components only where they actually appear; and `match-ref` lets an article inline a live scoreboard.

The union is exhaustive at the renderer, so a new block kind is a compile error until it is handled.

## 4. Competition module

Shared by Sport and Esports. CS2 is the first `discipline`, not a separate model.

### 4.1 `Discipline`

`id`, `slug`, `kind: 'sport' | 'esport'`, `title`, `icon`, `hasLiveScores: boolean`.

`hasLiveScores` gates the polling feature per discipline rather than hard-coding CS2.

### 4.2 `Match`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `MatchId` | |
| `discipline` | `DisciplineRef` | |
| `tournament` | `TournamentRef` | |
| `status` | `MatchStatus` | `scheduled` \| `live` \| `finished` \| `cancelled` |
| `startsAt` | `Date` | |
| `teams` | `[MatchSide, MatchSide]` | Fixed tuple — a match has exactly two sides |
| `score` | `MatchScore \| null` | `null` until play starts |
| `format` | `MatchFormat` | `bo1` \| `bo3` \| `bo5` |
| `maps` | `MatchMap[]` | CS2-specific detail, empty for other disciplines |
| `streams` | `StreamLink[]` | |

`status` is what decides caching: `scheduled` and `finished` are cacheable, `live` is never cached. See [api.md](./api.md) §5.

`MatchSide` is `{ team: TeamRef, score: number, isWinner: boolean }`.

`MatchMap` is `{ name, side1Score, side2Score, status }` — the CS2 per-map breakdown. Keeping it on `Match` rather than in a CS2-only entity avoids a parallel model for one field; other disciplines leave it empty.

### 4.3 `Team`

`id`, `slug`, `discipline`, `name`, `shortName`, `logo: ImageAsset`, `country`, `roster: PlayerRef[]`, `worldRanking: number | null`, `seo`.

### 4.4 `Player`

`id`, `slug`, `discipline`, `nickname`, `realName`, `photo`, `country`, `role`, `team: TeamRef | null`, `stats: PlayerStats`, `seo`.

`nickname` is the primary display name and the one in the URL; `realName` feeds `Person` JSON-LD.

`PlayerStats` is discipline-shaped and stays a narrow record (rating, K/D, maps played) rather than an open map, so the UI cannot render a key nobody validated.

### 4.5 `Tournament`

`id`, `slug`, `discipline`, `name`, `tier`, `prizePool`, `startsAt`, `endsAt`, `location`, `teams: TeamRef[]`, `standings: StandingRow[]`, `seo`.

Maps to `SportsEvent` JSON-LD, with matches as `subEvent`.

## 5. References

Entities do not embed each other in full. Each exposes a `*Ref` — the minimum needed to render a link:

```
AuthorRef      { id, slug, name, avatar }
CategoryRef    { id, slug, title }
TeamRef        { id, slug, name, shortName, logo }
PlayerRef      { id, slug, nickname, photo }
TournamentRef  { id, slug, name }
DisciplineRef  { id, slug, title, kind }
```

This keeps payloads bounded, prevents cycles (`Team` → `Player` → `Team`), and means an entity's own repository never has to hydrate a graph. Full objects are fetched by the widget that needs them.

`*Ref` types live in the referencing entity, exposed through its public API, so `entities/match` imports `TeamRef` from `entities/team`'s barrel. Where the FSD no-sideways-import rule blocks this, the `@x` cross-import public API is used.

## 6. Validation surface

| Boundary | What is validated |
| --- | --- |
| API response | Full schema parse in `entities/*/api` |
| Route params | Slug format, enum membership, id shape, in the route; failure calls `notFound()` |
| Search params | Page number, filter enums, coerced with defaults; never trusted as numbers |
| Form input | RHF + `zodResolver` on the client, re-parsed on the server |
| Environment | Parsed once at startup in `shared/config`; a missing variable fails the build |

Client-side validation is a convenience. The server re-parses everything, because the client schema is not a security boundary.

## 7. Errors

Parsing failures do not throw raw `ZodError` into rendering. `shared/api` normalises to a tagged result:

```
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }

type ApiErrorKind = 'network' | 'http' | 'contract' | 'not-found'
```

`contract` — a response that parsed badly — is distinct from `http` on purpose: it means the backend changed shape, and it should page someone rather than render an empty state. `not-found` maps to `notFound()`; the rest surface through the segment's `error.tsx`.
