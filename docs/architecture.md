# Architecture

## 1. Scope

A media platform with three content modules:

| Module | Domain |
| --- | --- |
| News | General editorial news |
| Sport | Traditional sport — football, basketball, … |
| Esports | Esports — CS2 first, Dota and Valorant planned |

This document defines the structure. It does not define UI, data or business logic — those arrive in later stages.

## 2. Stack and the role of each package

| Package | Version | Role in this architecture |
| --- | --- | --- |
| `next` | 16.3.2 | App Router, SSR, streaming, Metadata API, `robots.ts` / `sitemap.ts` |
| `react` / `react-dom` | 19.2.8 | Server Components by default, Client Components at interaction boundaries |
| `typescript` | 5.x | Contract layer. `any` is banned (§9) |
| `tailwindcss` | 4.x | The only styling mechanism. Inline `style` is banned (§9) |
| `@tanstack/react-query` | 5.x | **Client-side only.** Interaction-driven data — infinite feeds, live match polling, typeahead |
| `zod` | 4.x | Runtime validation at every external boundary; types are derived, never hand-written |
| `react-hook-form` | 7.x | Client-side forms only, bound to Zod via `@hookform/resolvers` |
| `axios` | 1.x | **Client-side transport only.** See §6.3 for why the server does not use it |
| `steiger` | 0.6 | Architecture linter — machine-enforces the layer rules in §4 |
| `pnpm` | 10.x | Package manager |

## 3. This is Next.js 16, not Next.js 14/15

Decisions below depend on behaviour that changed in v16, verified against the bundled docs in `node_modules/next/dist/docs/`.

| Change | Consequence here |
| --- | --- |
| `middleware.ts` deprecated, renamed to `proxy.ts` | We use `proxy.ts` if request-level logic is ever needed |
| Async Request APIs are mandatory | `params`, `searchParams`, `cookies()`, `headers()` are always awaited |
| `sitemap` receives `id` as a Promise | `generateSitemaps` consumers must await `id` |
| `opengraph-image` / `icon` receive `params` and `id` as Promises | OG image generators are async |
| `revalidateTag(tag)` requires a second `cacheLife` argument | Always `revalidateTag(tag, 'max')`; `updateTag` for read-your-writes |
| Turbopack is the default for `dev` and `build` | No `--turbopack` flag, no webpack config |
| `cacheComponents` supersedes `ppr` / `dynamicIO` / `useCache` | See §5 |
| `dynamic`, `revalidate`, `fetchCache`, `dynamicParams` removed under Cache Components | No route segment cache config anywhere in `app/` |

## 4. Layer model

### 4.1 The collision between FSD and Next.js

Feature-Sliced Design names its layers `app`, `pages`, `widgets`, `features`, `entities`, `shared`. Next.js reserves `app` and `pages` as router directories. This is a real conflict, not a stylistic one.

`node_modules/next/dist/lib/find-pages-dir.js` resolves router directories like this:

```
findDir(dir, name):  ./{name}  →  ./src/{name}  →  null

findPagesDir(dir):
  pagesDir = findDir(dir, 'pages')
  appDir   = findDir(dir, 'app')
  if (pagesDir && appDir && dirname(pagesDir) !== dirname(appDir)) throw
```

Two arrangements fail:

- Router at `app/` + FSD layer at `src/pages/` → parents differ → **build throws**: "`pages` and `app` directories should be under the same folder".
- Router at `src/app/` + FSD layer at `src/pages/` → same parent, no throw, but `src/pages` is silently adopted as the **Pages Router**, turning every FSD file into a public route.

Both were verified against this project, not assumed. Creating `src/pages/probe.ts` reproduced the build error exactly; removing it restored the build.

### 4.2 Why the layer is not simply renamed

`@feature-sliced/filesystem` strips a leading prefix before matching a layer name, which suggests `_pages` and `_app` as an escape:

```
removePrefix(path) → path.replace(/^([0-9]_|_)/, '')
layer = layerSequence[layerSequence.indexOf(removePrefix(name))]
```

This was tried and rejected, because Steiger applies the prefix rule inconsistently:

- `getLayers()` calls `removePrefix` — so `_app` maps to the `app` layer.
- `isSliced()` does **not**. It tests the raw basename against `["shared", "app"]`, so `_app` is classified as a *sliced* layer and its segments are reported as segmentless slices.
- `fsd/typo-in-layer-name` does **not**. It Levenshtein-matches the raw name, so `_app` is reported as a typo of `app`.

Running Steiger against an `_app` layer produced exactly those two false errors. Silencing them would mean disabling a correctness rule to prop up a workaround.

### 4.3 The resolution

**The Next.js App Router *is* the pages layer.** It occupies the same architectural role FSD assigns to `pages`: one unit per route, composing lower layers, owning route metadata. Giving it a second, parallel home in `src/` duplicates the concept.

```
app/          Next.js App Router — the pages layer, in Next.js convention
src/
  app/        FSD app layer  — global styles, runtime config, provider wiring
  widgets/    Composite blocks   — self-contained page sections
  features/   User interactions  — verbs: search, filter, subscribe
  entities/   Domain units       — nouns: article, match, team, player, tournament
  shared/     Reusable, domain-agnostic — transport, ui-kit, lib, config
```

There is no `pages` directory anywhere, so `findPagesDir` never sees one and the collision cannot occur. Every remaining layer keeps its canonical FSD name, so every Steiger rule applies without exception.

`src/app` and root `app/` are two halves of one layer, split only because Next.js requires the router at a fixed path. Root `app/` holds routing; `src/app` holds what the root layout wires in. Next.js ignores `src/app` because `findDir` prefers `./app`, which is documented behaviour and verified by the build.

The invariant that keeps this unambiguous: **`@/` always means `src/`, and nothing ever imports from root `app/`.** The router is a leaf of the dependency graph, so `@/app/...` can only mean the FSD app layer.

### 4.4 Import direction

```
app/ (router)  →  widgets  →  features  →  entities  →  shared
                                   ↑
                              src/app wires providers and styles into app/layout.tsx
```

A layer may import from layers below it, never from its own level or above. `shared` imports nothing from the project. Verified: an import from `shared/lib` up to `entities` is reported as `Forbidden import from higher layer "entities"`.

### 4.5 Slices and segments

Sliced layers (`widgets`, `features`, `entities`) divide into slices by domain. Unsliced layers (`app`, `shared`) divide directly into segments.

Segments are named by **purpose**. Only these five names are conventional:

| Segment | Contents |
| --- | --- |
| `ui` | Presentation |
| `api` | Outbound requests and their Zod contracts |
| `model` | Types, schemas, derived state |
| `lib` | Local helpers and wiring |
| `config` | Constants, feature flags |

Steiger rejects segments named after *what they contain* rather than *what they are for*. Its banned list includes `types`, `utils`, `helpers`, `constants`, `stores`, `services`, `schemas`, `validators` — and also `providers`. Two names in this project changed as a direct result:

- `shared/types` → `shared/model`
- `app/providers` → `app/lib`

Steiger's per-path rule overrides were not used to keep the original names. Its `files` globs are matched with micromatch against absolute paths, which on Windows are backslash-separated, so a pattern like `./src/app/**` never matches and the override silently does nothing. Configuration that only works on one platform is worse than no configuration, so the layout conforms to the rule instead of suppressing it.

Every slice exposes a public API via `index.ts`. Cross-slice imports reach the barrel only, never a file inside a slice. Verified: importing `@/entities/article/model/article` is reported as `Forbidden sidestep of public API`.

## 5. Rendering and caching model

### 5.1 Server Components by default

Every component is a Server Component unless it needs state, effects, event handlers or browser APIs. `'use client'` is placed on the smallest possible leaf, never on a layout or a page.

`'use client'` is a module-graph boundary: everything a client module imports joins the client bundle, so the directive is pushed down, not up. In particular it never goes on a slice barrel, which would pull the whole slice into the browser.

Server Components fetch data. Client Components receive it as serialisable props, or render server-rendered subtrees passed through `children`.

### 5.2 Cache Components is enabled

`next.config.ts` sets `cacheComponents: true`. Data fetching becomes **dynamic by default** and caching becomes **opt-in** through `use cache`, and Partial Prerendering becomes the default: Next.js prerenders a static shell, serves it immediately, and streams dynamic content as it resolves.

This suits a media platform precisely, because one page mixes content with different lifetimes:

| Content | Treatment |
| --- | --- |
| Site chrome, navigation, article body | `use cache` with a long `cacheLife` profile |
| Feed listings | `use cache` with a short profile, invalidated by tag on publish |
| Live CS2 scores | Uncached — streams in behind a Suspense boundary |
| Personalised UI | Client Component, or `use cache: private` |

Consequences accepted with this flag:

- Node.js runtime is required. `runtime = 'edge'` is not available.
- `dynamic`, `revalidate`, `fetchCache` and `dynamicParams` no longer exist. Cache policy is expressed with `use cache` + `cacheLife`, not with segment exports.
- Reversible: removing the flag restores the previous model, at the cost of reintroducing segment config.

Cache profiles are declared in `next.config.ts` and listed in [api.md](./api.md).

### 5.3 Invalidation

| API | Use |
| --- | --- |
| `cacheTag(tag)` | Tag a cached scope, inside `use cache` |
| `revalidateTag(tag, 'max')` | Editorial publish webhooks. Stale-while-revalidate |
| `updateTag(tag)` | Server Actions needing read-your-writes |

The one-argument `revalidateTag(tag)` is deprecated in v16 and is a TypeScript error.

## 6. Data flow

### 6.1 Server path — the default, and the SEO-relevant one

```
Route (app/**/page.tsx)
  └─ Widget (src/widgets/*)
       └─ Entity repository (src/entities/*/api)
            └─ shared/api server transport
                 └─ Zod parse  →  typed domain model
```

Everything above the transport is server-rendered. This is what crawlers receive.

### 6.2 Client path — interaction only

```
Client Component ('use client')
  └─ TanStack Query hook (src/features/*/api)
       └─ shared/api axios client
            └─ Zod parse  →  typed domain model
```

TanStack Query is **never** used to load a page's initial data. Doing so would move content out of the server-rendered HTML and defeat the SEO requirement in [seo.md](./seo.md). It is reserved for what only exists after interaction: pagination beyond page 1, live score polling, typeahead results.

### 6.3 Why the server does not use Axios

Axios runs on `http` / `XMLHttpRequest`, not on the `fetch` that Next.js instruments. On the server that costs request memoisation within a render pass and interoperability with the framework's caching layer. Native `fetch` is used there.

On the client, Axios earns its place: interceptors for auth and error normalisation, cancellation, and progress.

Both transports produce the same Zod-validated domain models, so the boundary is invisible above `entities/*/api`. ESLint enforces the split in both directions — server transport cannot import `axios`, and `features` / `widgets` cannot import the server transport. Full contract in [api.md](./api.md).

### 6.4 Validation boundary

Every response from outside the process is parsed with Zod before it is allowed into the application. Domain types are derived with `z.infer`; they are never declared by hand and never widened to `any`. An unparsed response is a bug, not a shortcut.

## 7. The routing layer

`app/` holds routing files and route-local composition. A `page.tsx` resolves params, composes widgets, and exports `generateMetadata`.

Route-local helpers — metadata builders, JSON-LD builders, param schemas — are colocated in Next.js private folders (`_lib`), which the router excludes from routing. Anything needed by a second route moves down into `widgets` or below.

Nothing in `src/` imports from `app/`. Route table in [routes.md](./routes.md).

## 8. Module boundaries

Slice inventory per layer, and the rules for adding one, are in [modules.md](./modules.md). Domain models are in [data-model.md](./data-model.md).

## 9. Enforced constraints

| Constraint | Enforcement | Verified |
| --- | --- | --- |
| No `any` | ESLint `@typescript-eslint/no-explicit-any` + TS `strict` | Yes — probe rejected |
| No inline CSS | ESLint `react/forbid-dom-props` / `forbid-component-props` on `style` | Yes — probe rejected |
| No `index.css`, no CSS Modules, no Sass | ESLint `no-restricted-imports`; the single sheet is `src/app/styles/global.css` | Config in place |
| Layer import direction | Steiger `fsd/forbidden-imports` | Yes — probe rejected |
| Public API only | Steiger `fsd/no-public-api-sidestep`, `fsd/public-api` | Yes — probe rejected |
| No sideways imports | Steiger `fsd/no-cross-imports`, enabled explicitly | Config in place |
| Purpose-named segments | Steiger `fsd/segments-by-purpose` | Yes — forced two renames |
| Server / client transport split | ESLint `no-restricted-imports`, both directions | Config in place |
| No `pages` / `app` collision | Structural — no `pages` directory exists | Yes — `next build` passes |
| Server Components by default | Review; `'use client'` on leaves only | Review |
| No comments in code | Review convention | Review |

Setup, commands and known tooling issues in [development.md](./development.md).
