# Modules

Layer contents, and the rules for adding to them.

## 1. Layer reference

| Layer | Directory | Sliced | Answers |
| --- | --- | --- | --- |
| pages | `app/` (the router) | By route | What is on this route? |
| app | `src/app` | No | How does the application start? |
| widgets | `src/widgets` | Yes | What is this self-contained block? |
| features | `src/features` | Yes | What can the user *do*? |
| entities | `src/entities` | Yes | What is this domain *thing*? |
| shared | `src/shared` | No | What is reusable and domain-agnostic? |

Import direction is downward only:

```
app/ (router)  →  widgets  →  features  →  entities  →  shared
```

A slice may not import a sibling slice on its own layer (`fsd/no-cross-imports`). When two slices need the same thing, it moves down a layer.

## 2. `src/app` — application layer

Unsliced. Segments only. Must not contain a `ui` segment (`fsd/no-ui-in-app`).

| Segment | Contents |
| --- | --- |
| `config` | Runtime configuration parsed from environment with Zod |
| `lib` | Provider wiring — the TanStack Query client provider, and any future context providers |
| `styles` | `global.css`, the single global stylesheet and Tailwind entry point |

Two naming notes, both forced by the linter rather than chosen:

- The provider segment is `lib`, not `providers`. Steiger's `fsd/segments-by-purpose` bans `providers` along with `types`, `utils`, `helpers` and `stores`, because a segment should say what it is *for*, not what it *contains*.
- The stylesheet is `global.css`, not `index.css`. `index.*` is reserved for public API barrels, and a stylesheet is not a public API.

Providers are rendered as deep as possible — wrapping `{children}` inside `<body>`, never wrapping `<html>` — so the static parts of the tree stay server-rendered.

## 3. `app/` — the routing layer

One unit per route. Composes widgets, resolves params, produces metadata and JSON-LD. Route inventory is in [routes.md](./routes.md); it is not repeated here.

Route-local helpers are colocated in `_lib` private folders:

```
app/(site)/news/[slug]/
  page.tsx
  _lib/
    metadata.ts       buildMetadata
    json-ld.ts        buildArticleJsonLd binding
    params.ts         Zod schema for the slug
```

This layer is governed by ESLint rather than Steiger, since it lives outside the Steiger root.

## 4. `widgets` — composite blocks

A widget is a page section that is complete on its own: it fetches what it needs and renders it. Widgets are the unit of streaming — each one needing uncached data sits behind its own `<Suspense>` boundary.

| Slice | Used by |
| --- | --- |
| `site-header` | all `(site)` routes |
| `site-footer` | all `(site)` routes |
| `article-feed` | home, news, news category, sport discipline |
| `article-body` | news article, sport article |
| `article-sidebar` | article routes |
| `match-center` | esports discipline hub, matches |
| `match-scoreboard` | match detail |
| `team-roster` | team detail |
| `tournament-bracket` | tournament detail |
| `standings-table` | sport discipline, tournament detail |

A block used on exactly one route and unlikely to move stays in that route's `_lib`/`page.tsx`. It is promoted to `widgets` on its second consumer.

## 5. `features` — user interactions

A feature is a verb. If it does not involve the user doing something, it is not a feature.

| Slice | Interaction | Stack |
| --- | --- | --- |
| `article-search` | Typeahead search | RHF + Zod + TanStack Query |
| `feed-pagination` | Load more / infinite scroll | TanStack Query |
| `feed-filter` | Filter by category, date, tag | URL search params |
| `match-live-updates` | Poll live scores | TanStack Query, refetch interval |
| `newsletter-subscribe` | Subscribe form | RHF + Zod + Server Action |
| `locale-switch` | Change language | — |
| `theme-switch` | Light / dark | — |

Every feature here is a Client Component, which is expected: features are where interaction lives. The `'use client'` directive goes on the interactive leaf inside `ui`, never on the slice barrel — a barrel carrying the directive pulls the whole slice into the client bundle.

## 6. `entities` — domain units

An entity owns a domain model, its Zod schema, its data access and its minimal presentation.

| Slice | Model | Used by |
| --- | --- | --- |
| `article` | Editorial article, any module | news, sport, esports |
| `category` | Article taxonomy | news |
| `author` | Byline | news, sport |
| `discipline` | Sport or esport discipline | sport, esports |
| `match` | Fixture / result | esports, sport |
| `team` | Competitive team | esports, sport |
| `player` | Competitor | esports |
| `tournament` | Competition | esports |

Standard shape:

```
entities/article/
  api/      repository functions — use cache, cacheTag, Zod parse
  model/    schema, inferred types, mappers
  lib/      buildArticleJsonLd
  ui/       ArticleCard, ArticleMeta — presentation of this entity alone
  index.ts  public API
```

`article` is deliberately one entity across News, Sport and Esports rather than three. All modules publish the same shape; the module is a property of the article, not a separate type. Splitting them would duplicate the schema, the repository and the JSON-LD builder. `discipline` carries what actually differs.

Entities do not import each other. Where an article needs its author, composition happens one layer up, in a widget. Where a model must reference another entity's type, the `@x` cross-import public API is used — sparingly, and it is a signal to reconsider the split.

## 7. `shared` — reusable, domain-agnostic

Unsliced. Segments only. Nothing here knows what an article or a match is.

| Segment | Contents |
| --- | --- |
| `api` | `serverFetch` (native fetch, server), `httpClient` (axios, client), response envelope, error normalisation |
| `config` | Environment schema, site constants, cache profiles, cache tag builders, route constants |
| `lib` | Framework-agnostic helpers, grouped by purpose: `lib/date`, `lib/url`, `lib/seo` |
| `model` | Cross-cutting contracts: branded ids, `Paginated<T>`, `ApiResult<T>` |
| `ui` | Design-system primitives: `Button`, `Card`, `Skeleton`, `Pagination`. Tailwind only |

The types segment is `model`, not `types` — same `segments-by-purpose` rule as §2.

`shared/lib` is grouped by purpose, never a flat `utils` or `helpers` dump; `fsd/shared-lib-grouping` and `fsd/segments-by-purpose` both reject that.

Public API placement in `shared` follows the linter's actual rule, which differs by segment:

- `api`, `config`, `model` — one `index.ts` per segment.
- `lib`, `ui` — one `index.ts` per top-level folder inside the segment (`lib/date/index.ts`, `ui/button/index.ts`), not at the segment root.

## 8. Adding a slice

1. Name it after the domain concept, singular, kebab-case.
2. Pick the layer by the question it answers (§1). If two layers seem to fit, choose the lower one.
3. Create only the segments it needs. An empty `ui/` or `model/` is noise, and a slice with no segments at all is an error.
4. Add `index.ts` as the public API. Export the minimum.
5. Run `pnpm lint:arch`. A new violation is a design signal, not a lint annoyance.

Duplication across two slices is cheaper than a sideways import. When the duplication is real, move it down a layer.
