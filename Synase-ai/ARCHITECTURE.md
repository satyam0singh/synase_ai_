# SYNASE AI — Frontend Architecture

This document describes how the frontend is organised after the structural
refactor. It is the reference for *where code goes* and *what may import
what*.

- [1. Overall architecture](#1-overall-architecture)
- [2. Folder responsibilities](#2-folder-responsibilities)
- [3. Application flow](#3-application-flow)
- [4. The domain modules](#4-the-domain-modules)
- [5. Shared context](#5-shared-context)
- [6. State management](#6-state-management)
- [7. API organisation](#7-api-organisation)
- [8. Styling and theme](#8-styling-and-theme)
- [9. Dependency rules](#9-dependency-rules)
- [10. How to add a feature](#10-how-to-add-a-feature)
- [11. How to add an API](#11-how-to-add-an-api)
- [12. What changed, and why](#12-what-changed-and-why)

---

## 1. Overall architecture

SYNASE AI is a dependency-free ES-module frontend. There is no framework, no
bundler and no runtime package dependency — `npm run build` is a file copy and
`npm test` is `node:test`.

The code is organised as a strict three-layer stack:

```text
        ┌─────────────────────────────────────────────┐
        │  app/            shell, router, bootstrap  │  orchestration only
        └──────────────────────┬──────────────────────┘
                               │ imports pages
     ┌───────────┬───────────┬──┴────┬───────────┬───────────┐
     │ home/     │ product/  │ devops/│ mcp/      │ context/  │
     │           │           │       │           │ outputs/  │
     │           │           │       │           │ integrations/
     └───────────┴───────────┴───┬───┴───────────┴───────────┘
                                 │ imports only from
     ┌───────────────────────────┴───────────────────────────┐
     │  shared/    api, state, components, utils, services  │  no outbound deps
     └───────────────────────────────────────────────────────┘
```

Two properties are enforced mechanically:

1. **A domain never imports another domain.** Product, DevOps and MCP are
   siblings. Cross-domain needs are met through `shared/`.
2. **`shared/` imports nothing outside itself.** It is a leaf layer.

### The single-router rule

Before this refactor three modules each believed they owned the `#main`
element and each wrote into it from its own `MutationObserver`:

| Module | Owned | Mechanism |
| --- | --- | --- |
| `src/app.js` (1372 lines) | all of `#app` | `render()` on every state change |
| `src/phase11.js` | `#main` | own listeners + `MutationObserver` |
| `src/phase12.js` | `#main` | own listeners + `MutationObserver` |

All three re-read `location.hash` independently, so which render survived was
not statically determined. In practice `phase12` always won on
`/app/dashboard` and `phase11` always won on the integrations routes.

Those outcomes are now **declared** in `app/router.js` rather than raced.
There is exactly one router and one delegated event listener.

---

## 2. Folder responsibilities

```text
src/
├── app/                     Application shell and orchestration
│   ├── main.js              bootstrap: hydration, data loading, one event listener
│   ├── router.js            the only route → page mapping
│   ├── shell.js             sidebar, topbar, switchers, toast
│   ├── paths.js             route table, currentPath(), navigate(), isActive()
│   ├── actions/work.js      Chat & Work controller (render/toast injected)
│   └── auth.js              login / register / recover screens
│
├── home/
│   ├── landing/
│   │   └── landing.js       landing-page behaviour (auth modal, scroll reveal)
│   ├── workspace/
│   │   ├── api/index.js     workspace domain API surface
│   │   ├── dashboard/       the /app/dashboard decision view + its API
│   │   │   ├── view.js
│   │   │   ├── api.js
│   │   │   └── types.d.ts
│   │   └── pages/           projects · repository · inputs · analysis · runs · members
│   └── settings/pages/      workspace settings · project settings
│
├── product/                 Product Intelligence
│   ├── pages/index.js       requirements · prioritisation · strategy · roadmap
│   └── api/index.js
│
├── devops/                  DevOps Intelligence
│   ├── pages/index.js       architecture · quality · security · risk · testing · deployment
│   ├── components/index.js  findings table
│   └── api/index.js
│
├── mcp/                     MCP V2
│   ├── pages/index.js       overview · executions · tools · models · discovery
│   └── api/index.js
│
├── context/                 Shared context and knowledge
│   ├── pages/index.js       explorer · memory · retrieval history · knowledge graph
│   └── api/index.js
│
├── outputs/                 Decision outputs
│   ├── pages/index.js       reports · report detail · approval queue
│   └── api/index.js
│
├── integrations/            Integrations, activity and audit
│   ├── pages/index.js
│   └── api/{client.js,types.d.ts}
│
├── work/                    Chat & Work — the post-login surface
│   ├── constants.js         layers, agent capabilities, effort levels, starters
│   ├── pages/index.js       the standalone chat page
│   ├── components/index.js  thread, contextual menu, composer chips, artifact panel
│   └── api/index.js
│
├── shared/                  Everything with more than one consumer
│   ├── api/                 db · mock · live · errors · idempotency · redaction
│   ├── components/ui.js     escapeHtml · status · pageHeader · metricCard · …
│   ├── state/store.js       the single application store
│   ├── services/theme.js    light/dark switching and persistence
│   ├── utils/format.js      escapeHtml · initials · formatBytes
│   └── types/types.d.ts
│
├── styles/
│   ├── app.css              design tokens + shell + all component styles
│   ├── home/dashboard.css
│   ├── integrations/integrations.css
│   ├── landing/landing.css
│   └── work/work.css        Chat & Work surface, scoped to .work-*
│
└── assets/                  branding and images
```

A folder exists only because code lives in it. There are no placeholder
directories.

### Assets

`assets/` is still flat. The only external reference is
`src/assets/favicon.svg` from `app.html` and `landing.html`; the logo SVGs are
referenced by `scripts/generate-logo.mjs`. Splitting them would have required
changing paths with no functional gain, so the folder was left intact rather
than churned for appearance.

---

## 3. Application flow

```text
app.html
  └─ inline <head> script        sets data-theme before first paint
  └─ <script type="module">      src/app/main.js
        └─ initTheme()           wires the theme toggles
        └─ render()
              └─ app/router.js    renderPage()
                    ├─ currentPath()          app/paths.js
                    ├─ route → page module    (domain layer)
                    └─ shell()                app/shell.js
        └─ hydrate()
              ├─ workspaceApi   session, projects, repository, inputs, workflows
              ├─ productApi     requirements, strategy, roadmap
              ├─ devopsApi      findings, dependencies, tests, deployments
              ├─ contextApi     context items, memory, graph
              ├─ outputsApi     reports, approvals
              └─ mcpApi         catalogs, traces, servers, directories
        └─ loadRouteData()
              ├─ /app/dashboard          phase12 dashboard contract
              └─ integrations routes     provider / activity / audit contracts
```

### Event handling

There is one delegated `click`, `change`, `input` and `submit` listener, all in
`app/main.js`. Views never attach listeners; they emit intent through
attributes:

| Attribute | Meaning |
| --- | --- |
| `data-route="/app/..."` | navigate |
| `data-action="product-tab"` | mutate state and re-render |
| `data-auth="open"` (landing) | landing-page auth overlay |
| `data-theme-toggle` | theme switching (handled by `shared/services/theme.js`) |

`data-p11-route`, `data-p11-action` and `data-p12-route` were normalised to
`data-route` / `data-action` during the refactor so the single listener covers
every route group. Behaviour is unchanged; a differential test proves the
rendered markup is otherwise byte-identical.

---

## 4. The domain modules

Each domain owns its views and a narrow API surface, and imports only from
`shared/`.

### product

Requirements, prioritisation, strategy and roadmap. `product/api/index.js`
exposes `listRequirements`, `listProductFeatures`, `getProductStrategy`,
`listRoadmapItems` and `runProductMock`. Suggestions remain visually
separated from confirmed state by the shared `provenance()` helper.

### devops

Architecture, quality, security, risk, dependency, testing and deployment
views over the shared `findingsTable`. Exposes `getDevOpsSummary`,
`listFindings`, `listDevOpsRecommendations`, `listDependencies`,
`listTestSuggestions`, `listDeploymentPlans` and `runDevOpsMock`.

### mcp

Deliberately isolated: **nothing in `mcp/` imports from `product/` or
`devops/`**. Exposes overview, requests, traces, models, tools, servers,
directories, health checks and discovery, plus the shared `redactMcpPayload`.

### context, outputs, integrations

Real route groups that did not fit the four named domains. They were given
their own folders rather than being mislabelled as shared infrastructure, since
folding them into `product/` or `shared/` would have misrepresented their
dependencies.

`home/workspace/dashboard/` holds the decision dashboard that formerly lived
in `src/phase12.js`, and `integrations/` holds the views formerly in
`src/phase11.js`.

### work — Chat and Work surfaces

**Chat is standalone.** Landing CTAs and a successful sign-in both land on
`/app/chat`, which renders **without** `shell()` and owns the full viewport —
no platform sidebar, no topbar. `app/router.js` checks the chat route *before*
the loading branch so the page never flashes the console chrome.

**Work is the existing dashboard.** `/app/dashboard` stays inside the shell and
is now labelled "Work" in the sidebar. A surface switch sits above the
dashboard, and the chat header carries the matching toggle.

The loop is closed in both directions: the chat header's "Work" tab goes to the
dashboard, and the dashboard's "Switch to Chat" plus the sidebar's "Chat" entry
return.

`work/` is a sibling domain, not a sibling page: it has its own views, its own
constants, and its own API facade, and it imports only from `shared/`.

Three independent controls sit in the composer, each owning one popover:

| Control | Opens | Contents |
| --- | --- | --- |
| `＋` | Agent Mode | Video · Image · Web-Search · Code · Text |
| layer chip | layer | Product Layer · DevOps Layer |
| effort chip | effort | Auto · Low · Medium · High · Max |

The `＋` control is Agent Mode and nothing else, so a session already scoped
to Product or DevOps cannot re-pick its layer from it. Layer and effort are
changed from the chips that display them, which is why the three popovers are
independent rather than one cascading menu.

`src/work/constants.js` holds the vocabulary. Adding a capability means adding
one entry — no other file changes.

`src/app/actions/work.js` is a controller rather than a page module because the
surface needs `render()` and `toast()`, which close over the router and the
shell. Those are injected at boot; importing them would make the two modules
mutually dependent.

**The surface calls nothing.** `runWorkAssistant` returns a receipt with
`modelInvoked`, `toolInvoked`, `externalContacted` and `downstreamExecuted`
all false, artifacts carry `provenance: "ai_suggested"`, and the same prompt
always produces the same reply. See invariants `inv-21` and `inv-22`.

---

## 5. Shared context

`shared/` holds only code with more than one real consumer.

| Module | Contents |
| --- | --- |
| `api/db.js` | the in-memory fixture store |
| `api/mock.js` | the deterministic adapter (~78 methods) |
| `api/live.js` | the `fetch` adapter, used by the live boundary |
| `api/errors.js` | `ApiError` |
| `api/idempotency.js` | `createIdempotencyKey` |
| `api/redaction.js` | `redactMcpPayload`, `normalizeWorkflowEvents` |
| `state/store.js` | the application store |
| `components/ui.js` | presentational helpers |
| `services/theme.js` | theme switching and persistence |
| `utils/format.js` | `escapeHtml`, `initials`, `formatBytes` |

### Why `db.js` is one module and not split per domain

The fixture tables are genuinely cross-referenced: a dashboard aggregate reads
projects, findings, reports and approvals together, and MCP fixtures reuse
product-layer identifiers. Splitting the *data* would have invented coupling
that does not exist and would have required a shared-across-domains bag anyway.

Instead the **data** stays in one place and the **surface** is partitioned:
each domain's `api/index.js` exposes only the methods it uses. There is still
exactly one implementation of every method.

---

## 6. State management

A single plain object in `shared/state/store.js`. No reactivity library, no
immutability requirement — the access patterns from the original build are
unchanged, so behaviour is preserved.

Scope classification:

| Scope | Keys |
| --- | --- |
| Global | `user`, `workspaces`, `workspaceId`, `projectId`, `members`, `toast`, `sidebarOpen`, `loading`, `error` |
| Workspace | `repositories*`, `assets`, `conversations*`, `messages`, `analysisRequests`, `workflows*`, `decisionDashboard*` |
| Domain | `requirements`/`productFeatures`/`productStrategy`/`roadmapItems`/`productTab`; `devops*`; `mcp*`; `context*`; `reports*`/`approvals*`; `integration*`/`activity`/`auditEvents` |
| Local UI | active tab ids, `repositoryDetailId`, `auditDetail`, `streamState` |

The three former state literals (`src/app.js`, `src/phase11.js`,
`src/phase12.js`) were merged into this object. Two keys were renamed to avoid
collisions and to stop pretending two competing dashboards exist:

- `dashboard` → `decisionDashboard` (Phase 12 owns `/app/dashboard`)
- phase11's `providers` / `connections` / `runs` → `integration*`

`resetProjectScope()` clears the project-scoped projections when the selection
becomes empty.

---

## 7. API organisation

UI never calls `fetch` or the adapter directly. The flow is:

```text
view  →  domain api facade  →  shared adapter  →  mock store | live fetch
```

Domain facades are thin named subsets, for example:

```js
// devops/api/index.js
import { api } from "../../shared/api/index.js";

export const devopsApi = {
  getDevOpsSummary: (projectId) => api.getDevOpsSummary(projectId),
  listFindings: (projectId) => api.listFindings(projectId),
  /* … */
};
```

This is the one place where the earlier plan was adapted. The obvious move —
physically distributing ~78 interdependent mock methods across four folders —
would have meant rewriting the most-executed file in the app for no
architectural gain, because the methods share one fixture store and call each
other. The facade approach gives the same boundary discipline at a fraction of
the regression risk, and the contract is explicit and greppable.

Endpoints, HTTP methods, request bodies, headers, idempotency keys and response
shapes are unchanged. `integrations/api/client.js` (formerly
`phase11-api.js`) and `home/workspace/dashboard/api.js` (formerly
`phase12-api.js`) keep their own error classes and redaction helpers.

---

## 8. Styling and theme

No styling framework, no renamed classes.

| File | Scope |
| --- | --- |
| `styles/app.css` | design tokens, reset, shell, every component |
| `styles/home/dashboard.css` | dashboard panels and progress |
| `styles/integrations/integrations.css` | provider cards, audit layout |
| `styles/landing/landing.css` | the landing page, extracted from its inline `<style>` |

Load order in `app.html` is app → dashboard → integrations, matching the
original cascade.

### Tokens and dark mode

Every colour in every stylesheet is a semantic token. `:root` holds the light
palette (the grey ramp lifted from antigravity.google) and
`[data-theme="dark"]` overrides 63 tokens with the same ramp inverted plus
Google's dark status colours.

The token set covers surfaces, ink, accent washes and lines, separators,
status washes, elevation and artwork gradients. That is why the dark theme
needed no per-rule work: no rule contains a raw colour.

`shared/services/theme.js` owns switching, `localStorage` persistence and the
`prefers-color-scheme` fallback; both HTML entry points set `data-theme` in an
inline `<head>` script so there is no flash of the wrong theme.

---

## 9. Dependency rules

```text
app/       →  domain modules  →  shared/
```

Forbidden:

```text
product/  →  devops/…          ✗
devops/   →  product/…         ✗
mcp/      →  product/…         ✗
work/     →  product/…         ✗
domain    →  app/ (except paths.js)   ✗
shared/   →  anything else     ✗
```

Two sanctioned exceptions:

- a domain may import `app/paths.js` for the route table — that module is
  dependency-free by design, so no cycle is possible;
- `app/` may import any domain, since it is the composition root.

If two domains genuinely need to collaborate, add the capability to `shared/`
rather than importing across.

---

## 10. How to add a feature

1. **Decide the domain.** Workspace → `home/workspace`; product decisions →
   `product`; engineering findings → `devops`; MCP → `mcp`; context and
   knowledge → `context`; reports and approvals → `outputs`; providers →
   `integrations`. If it genuinely belongs to none of them, it is a new
   domain folder with its own `pages/` and `api/`.
2. **Add the view** in that domain's `pages/` folder. Return a template string,
   escape every interpolated value, and use `data-route` / `data-action` for
   interaction — no listeners.
3. **Add the route** in `app/router.js`.
4. **Add the nav entry** in `app/shell.js` if it belongs in the sidebar.
5. **Add state** to `shared/state/store.js` under that domain's group.
6. **Handle the action** in the relevant block of `app/main.js`.

## 11. How to add an API

1. Add or reuse a method in `shared/api/mock.js` (and the fixtures in
   `db.js`). It must return `{ data, meta }`.
2. Export it through that domain's `api/index.js` facade.
3. Call it from `app/main.js`, never from a view.
4. For mutating calls pass `{ idempotencyKey: createIdempotencyKey() }`.
5. Add a contract test under `test/` importing the facade.

---

## 12. What changed, and why

### One router instead of three renderers

`src/app.js`, `src/phase11.js` and `src/phase12.js` all wrote into `#main`.
`app/router.js` now owns routing and `app/main.js` owns the single delegated
listener; the plugin-private attributes were normalised to the application
standard. The Phase 2 aggregate dashboard was removed because `phase12`
already overwrote it on every render — two dashboards existed and only one was
ever visible.

### Files removed as genuinely dead

- `src/design/tokens.css` — never linked; its first line was a `//` comment,
  which invalidates its `:root`, and its `.button` / `.card` / `.field` rules
  would have shadowed the real ones.
- `src/components/LoginPage.js` — never imported.
- `src/app.js`, `src/api.js`, `src/phase11.js`, `src/phase12.js` — superseded
  by the layers above.

### Files renamed by location only

`styles.css` → `styles/app.css`; `phase11.css` → `styles/integrations/integrations.css`;
`phase12.css` → `styles/home/dashboard.css`; `theme.js` → `shared/services/theme.js`;
`types.d.ts` → `shared/types/types.d.ts`.

### Landing page

Its 902 lines of CSS and 124 lines of behaviour moved to
`styles/landing/landing.css` and `home/landing/landing.js`. The eleven inline
`onclick` / `onsubmit` attributes became `data-auth*` attributes handled by one
delegated listener, removing the reliance on globals.

### Verification

- 64 contract tests pass, imports rewired to the new paths.
- `npm run build` succeeds.
- All 34 routes render under a DOM harness.
- The four retyped views (integrations, activity, audit, dashboard) were diffed
  against the originals and are byte-identical once the deliberate attribute
  renames are folded back.
- Dependency direction checked mechanically: no cross-domain or shared-outbound
  imports.