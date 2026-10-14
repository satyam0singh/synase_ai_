# SYNASE AI — Project Brain

Generated knowledge graph for the SYNASE AI frontend. This is the map you read before
touching code, and the map you regenerate after you change it.

```bash
npm run brain          # remeasure the source tree and rewrite brain/
npm run brain:query    # explore the graph
```

`brain/graph.json` is derived, not authored. Never edit it directly. Change
`scripts/brain-data.mjs` (the semantic layer) or the measurement step in
`scripts/brain-extract.mjs`, then regenerate. That way the map cannot quietly
disagree with the code.

---

## 1. What this project is

A static, dependency-free decision-intelligence frontend. It turns project context,
repository evidence, workflow and model/tool traces, findings, reports, and human
approvals into reviewable engineering decisions. It is not a chatbot and not a
database browser.

Every surface runs against deterministic mock domain services. **No backend is
connected and no external provider is contacted.** That is the single most important
fact about the current codebase: the product is fully designed and the server is
entirely absent.

Measured shape at generation time:

| Measure | Value |
| --- | --- |
| Version | `0.12.0` |
| Source lines (src + HTML) | 14,991 |
| Tracked files across 13 architecture layers | 90 |
| Test lines | 805 |
| Contract tests | 94 |
| Declared types across four `.d.ts` files | 106 |
| Mock fixture collections in `db` | 50 |
| Routes | 37 |
| Domain service methods | 137 across 4 services |
| Typed entities | 56, plus 6 with no interface at all |
| Safety invariants | 24 |
| Known contract gaps | 12 |
| Structural risks | 10, of which 2 resolved |

---

## 2. Architecture: six layers

```
Route
  → application shell          L0  src/app/main.js, router.js, shell.js, paths.js, actions/work.js
  → domain view templates      L1  src/{home,product,devops,mcp,context,outputs,integrations,work,settings}
  → domain service surface     L2  src/<domain>/api/index.js — named facades
  → mock or live adapter       L3  shared/api/mock.js + db.js, settings/engine/*; live fails closed
  → shared HTTP/SSE transport  L4  only exercised by tests today
  → /api/v1                    L5  does not exist
```

Module layout is a strict stack: `app/` → domains → `shared/`. Two of the three
rules below are mechanically checkable:

- **No domain imports another domain.** Product, DevOps, MCP, and Settings are siblings.
  Cross-domain needs are lifted into `shared/`.
- **`shared/` imports nothing outside itself.** It is a leaf layer.
- **Frontend domain models do not mirror persistence tables.** If a view needs a
  joined shape, an aggregate endpoint should provide it, not the browser.
- **Adapter selection belongs at the composition root.** Views never learn whether
  they are talking to a mock or a server.

See [ARCHITECTURE.md](../ARCHITECTURE.md) for the full dependency rules.

### The four services

| Service | File | Scope | Methods | Fixture |
| --- | --- | --- | --- | --- |
| `mockApi` | `src/shared/api/mock.js` | Phases 0–10, 15 | 91 | `db`, 50 collections |
| `phase11Api` | `src/integrations/api/client.js` | Integrations, activity, audit | 11 | module-private arrays + `receipts` Map |
| `phase12Api` | `src/home/workspace/dashboard/api.js` | Dashboard aggregate, readiness | 2 | frozen `dashboard` fixture |
| `settingsApi` | `src/settings/api/index.js` | Settings Control Plane (Phase 15) | 17 | `db.settingsValues`, keys, connectors, policies, registry |

Each domain additionally exposes a narrow facade (`devopsApi`, `mcpApi`,
`outputsApi`, `settingsApi`, …) built from `mockApi`. There is still exactly one implementation
of every method; only the surface is partitioned.

`phase12Api` is the only service with a live adapter factory,
`createPhase12Service({ mode, baseUrl, fetchImpl, timeoutMs })`. Phases 0–11 and 15 have no
live path whatsoever. Live mode is never enabled from an environment variable, and
`src/shared/api/live.js` exports a `liveApi` that always throws and has no caller.

---

## 3. Routing: one router, one listener

`src/app/router.js` owns `renderPage()` and resolves all 37 routes. Three auth routes
render without the shell; everything else is wrapped in `shell()`. A single delegated
`click` / `change` / `input` / `submit` listener in `src/app/main.js` handles every
action, and views never attach listeners of their own.

Path resolution order: `?route=` query parameter → `location.hash` → `/app/dashboard`.
Navigation uses `history.replaceState`, so the back button does not walk your history.

`/app/chat` is the post-login surface: the landing CTAs and a successful sign-in all
land there. It renders **outside** the shell — no platform sidebar or topbar — and
the router checks it before the loading branch so the console chrome never flashes.
`/app/dashboard` is the Work view and stays inside the shell. A surface toggle sits in
the chat header and above the dashboard.

`/app/settings` is the Settings Control Plane: it also renders **outside** the console
shell chrome as a dedicated full-page control plane on a clean white canvas (`#ffffff`),
avoiding nested boxed-in-a-box clustering while providing deep navigation across all 16
configuration domains and top navigation (`← Back to Console`) back to `/app/dashboard`.

The chat controller lives in `src/app/actions/work.js` with `render`/`toast` injected,
because importing them back would create a cycle with `main.js`.

> **Resolved.** This section previously described two modules (`phase11.js`,
> `phase12.js`) taking over `#main` from outside the router via a
> `MutationObserver`, so which dashboard rendered depended on script load order.
> That was tracked as `rsk-01` (high). Route ownership is now declared in
> `src/app/router.js`, the plugin-private `data-p11-*` / `data-p12-*` attributes
> were normalised to `data-route` / `data-action`, and the superseded Phase 2
> aggregate dashboard was deleted. See `dec-04` (reverted) and `dec-08`.

---

## 4. Domain model

Fifteen capability areas, each with fixtures, service methods, and a rendering view:

**Workspace** — `Workspace`, `WorkspaceMember`, `Project`, `ProjectMember`. Projects
are the unit of scoping for nearly everything else.

**Input** — `Repository`, `RepositorySnapshot`, `Asset`, `UploadInitiationResponse`.
Security scan status is deliberately separate from processing status; a blocked scan
is not a processing state.

**Conversation** — `ConversationSession`, `ConversationMessage`, `AnalysisRequest`.
Submitting an analysis returns a queued receipt, never a running workflow.

**Execution** — `WorkflowRun`, `WorkflowTask`, `WorkflowEvent`. Progress comes from
authoritative events, never from elapsed time. `db.workflowScripts` holds scripted
demo events that advance only when the user explicitly asks.

**MCP observability** — `McpRequest`, `McpTraceStage`, `McpModel`, `McpTool`,
`McpServer`, plus untyped directories and discovery runs. Three models ship as catalog
metadata: Claude Sonnet (200k, active), GPT reasoning (128k, active), Local evaluator
(32k, disabled). None is ever called.

**Product intelligence** — `Requirement`, `ProductFeature` (multi-criteria scoring & ranking), `ProductStrategy` (typed aggregate with tenets & risks), `RoadmapItem` (sequenced timeline with dependencies), `ProductDecision` (audited decisions linking evidence & subjects), and `ProductOverview` (metrics & bento projection). Sub-pages: Overview, Requirements (search/filters/inspector), Prioritization (score calibration matrix), Strategy, Roadmap, Decisions & Trace. Provenance distinguishes `confirmed` from `ai_suggested` (with confidence meter).

**DevOps intelligence** — `Finding`, `DevOpsRecommendation`, `DeploymentPlan`, plus
untyped dependencies, test suggestions, and a summary aggregate.

**Context and knowledge** — `ContextItem` (sensitivity + trust), `MemoryResult`
(ranked, no embeddings), `RetrievalRecord`, and a `KnowledgeGraph` whose edges
reference projected nodes only and hide store details behind a `backend-only` boundary.

**Outputs** — `DecisionReport`, `ReportExportArtifact`, `Approval`. Publication
requires approval. An approval decision never executes anything.

**Integrations, activity, audit** — providers and connections are separate resources;
authorization, connection, health, and sync are four independent states. Activity is
operational history; audit is an immutable read-only projection. No service exposes an
audit mutation, and the suite asserts that.

**Dashboard** — a workspace aggregate fixture that is explicitly labeled
`selected_project_mock` with `aggregateContractStatus: "unresolved"`, because the real
aggregate endpoint does not exist.

**Settings Control Plane** — `SettingDefinition`, `SettingValue`, `EffectiveSetting`, `ApiKeyItem`, `ConnectorItem`, `AutomationItem`, `AgentPolicy`. Manages 16 canonical domains across 5 categories (`general`, `workspace`, `members`, `roles`, `ai-models`, `routing`, `mcp-connectors`, `knowledge-sources`, `agent-policies`, `approvals-guardrails`, `api-keys`, `webhooks`, `integrations`, `audit-logs`, `usage-billing`, `advanced`). Resolves hierarchical configuration through strict scope precedence (`user` > `session` > `task` > `agent` > `project` > `workspace` > `system`) with fallback to schema default.

### Three shapes named `ActivityItem`

This is worth knowing before you import it:

| Declared in | Shape | Served by |
| --- | --- | --- |
| `src/shared/types/types.d.ts` | flat `actor: string` | `mockApi.getDashboard` |
| `src/integrations/api/types.d.ts` | `actor` object + `target` object + domain/outcome/source | `phase11Api.listActivity` |
| `src/home/workspace/dashboard/types.d.ts` | flat `actor` + `audit: false` | `phase12Api.getDashboard` |

One concept, three incompatible contracts, and a name collision across two type
modules. If you build a real backend, collapse these into one envelope first.

### Six entities with no interface

`devopsSummary`, `dependencies`, `testSuggestions`, `mcpDirectories`,
`discoveryRuns`, `workflowScripts` are served by real methods and rendered by real
views, but exist in no `.d.ts` file. They are the most likely source of silent drift
when a real backend arrives. They are tagged `entity-untyped` in the graph.

---

## 5. The 24 invariants

These are the project's actual product. Each is asserted by a test rather than
documented and hoped for.

1. Mock mode contacts no external provider, directory, server, or model
2. No secret reaches a display model or audit projection
3. Sensitive metadata is redacted recursively; raw headers and bodies are omitted, not truncated
4. Approval is not execution — `executed` and `downstreamExecuted` stay false
5. Connect is not authorization; authorization, connection, health, sync are four states
6. Elapsed time is never presented as workflow progress
7. A mock receipt is not a real action
8. Every mutation requires an idempotency key and replays the first receipt on retry
9. Unsafe mutations are never silently retried
10. No optimistic success on approvals, publications, or syncs
11. Domain models are not persistence models
12. Activity is not audit
13. Project scoping is enforced — cross-project ids are rejected as not found
14. AI-proposed is not confirmed state
15. A green build is never presented as backend connectivity
16. Live mode fails closed on missing base URL, unsafe scheme, or malformed response
17. Audit is read-only; no mutation surface exists
18. Every interpolated value is escaped before reaching `innerHTML`
19. One router owns `#main`, and one delegated listener handles every action
20. No domain imports another domain, and `shared/` imports nothing outside itself
21. The work surface calls no model or tool — `modelInvoked`, `toolInvoked`, `externalContacted` and `downstreamExecuted` are always false
22. Chat & Work artifacts are always `ai_suggested` and render as a proposal, never as confirmed state
23. Full secret values for API keys and credentials are shown exactly once in the creation receipt (`secretShownOnce: true`) and never persisted or queryable via list methods
24. Hierarchical configuration resolves through deterministic precedence (`user` > `session` > `task` > `agent` > `project` > `workspace` > `system`) with schema default fallback

Query them all with `npm run brain:query invariant`.

---

## 6. The 12 gaps

These are deliberately unresolved, and the README says so plainly. Do not infer them
from fixtures or UI copy.

| Gap | Blocks |
| --- | --- |
| `gap-01` Authentication and session contracts | L5 |
| `gap-02` Complete DTO and error schemas | L5, `phase12Api` |
| `gap-03` Pagination and mutation idempotency policy | L5, `phase12Api` |
| `gap-04` Workspace aggregate endpoints | L5, `phase12Api` |
| `gap-05` Active workspace/project context encoding | L5 |
| `gap-06` Permissions beyond roles | L5 |
| `gap-07` SSE envelope, auth, replay, retention | L5 |
| `gap-08` Signed upload flow | L5 |
| `gap-09` Realtime transport outside workflow SSE | L5 |
| `gap-10` Notification delivery | L5 |
| `gap-11` API compatibility and deprecation policy | L5 |
| `gap-12` Security-grade audit retention | L5 |

The frontend currently ships with `authenticated: true` hardcoded in
`src/shared/state/store.js`. That is the shape of `gap-01`.

---

## 7. The 10 risks

Run `npm run brain:query risk` for full detail. Two are now resolved; the ones
that will bite first are:

**`rsk-01` Two owners of `/app/dashboard` (high) — RESOLVED.** Previously
`src/app.js` rendered `dashboardPage()` while `src/phase12.js` overwrote `#main`
from a `MutationObserver`, so the winner depended on script load order. Route
ownership is now declared in `src/app/router.js` and the superseded Phase 2
aggregate was deleted. See `dec-04` (reverted).

**`rsk-05` Duplicated project hydrate cascade (medium) — RESOLVED.** The
seven-stage fetch previously appeared twice in `src/app.js`. It now lives once in
`hydrateProject()` and is called from both `hydrate()` and the project switcher.

**`rsk-04` `liveApi` is dead code (medium).** `src/shared/api/live.js` throws
unconditionally and nothing can select it. Either wire it or remove it; leaving it
implies a capability that does not exist.

**`rsk-02` / `rsk-03` the `ActivityItem` collision (medium).** Three fixtures, one
concept, and a name exported from two type modules. Collapse to a single envelope
before building a real backend.

**`rsk-06` Asymmetric clone semantics (low).** `shared/api/db.js` `page()` returns
live references into `db`, while the integrations and dashboard services use
`structuredClone`. List reads are mutable, single reads are snapshots. A caller can
mutate the fixture by accident.

**`rsk-09` One large orchestration module (low).** `src/app/main.js` is 771 lines
because it owns hydration, route-scoped loading, and every delegated action outside a
per-surface controller. The Chat & Work controller was extracted to hold the line, but
a second extraction will be needed if the surface keeps growing.

Also: `rsk-07` CI workflow file named `phase11-validate.yml` running the full suite,
`rsk-08` `npm run dev` needs `npm run build` first, `rsk-10` no lint or typecheck
script.

---

## 8. The decisions that shaped the code

| Decision | Consequence you inherit |
| --- | --- |
| `dec-01` Zero runtime dependencies | No framework, no bundler, string templates everywhere. Full control of shipped bytes. |
| `dec-02` Hash routing with `?route=` override | Deployable as static files. No real browser history. |
| `dec-03` Per-phase modules, not one growing `app.js` (status: **superseded**) | Phase boundaries stayed legible, but the modules bypassed the router. |
| `dec-04` `MutationObserver` takeover (status: **reverted**) | Was the mechanism behind `rsk-01`. Route ownership is now declared in `src/app/router.js`. |
| `dec-05` Mock as service implementation, not fixture leak | Swapping adapters never touches views. Cost: 74 methods to keep in sync with `types.d.ts`. |
| `dec-06` Only Phase 12 has a live factory | Live integration has exactly one reviewable seam. Phases 0–11 have none. |
| `dec-07` Negative claims are asserted, not assumed | The safety story is regression-protected. Cost: the 64 tests are load-bearing for product claims. |
| `dec-08` One router, one delegated listener | Route ownership is declared, not raced. Cost: a new module can no longer self-register without editing the router. |
| `dec-09` Domain layers with a shared leaf (`app/` → domains → `shared/`) | Boundaries are greppable and mechanically checkable. Cross-domain needs must be lifted into `shared/`. |
| `dec-10` One fixture store, partitioned API surface | Still exactly one implementation of every method, with an explicit per-domain facade. Cost: one extra indirection. |
| `dec-11` Chat renders outside the console shell | Signing in opens only the chat canvas, and the console chrome can never flash first. Cost: the chat carries its own header. |
| `dec-12` Three composer controls, not one cascading menu | `+` is Agent Mode only; layer and effort own their popovers, and the artifact panel collapses without losing its selection. Cost: three popovers, each with its own anchor. |
| `dec-13` Settings renders outside console chrome | Dedicated full-page control plane without console shell sidebar or nested boxes. Clean white canvas with top navigation back to console. Cost: Settings owns its own header and sidebar. |
| `dec-14` Deterministic scope precedence resolver | Pure hierarchical order (`user` > `session` > `task` > `agent` > `project` > `workspace` > `system`). Predictable override behavior across all 16 domains. |

---

## 9. Where to go next

Phases 0–15 ship. Everything below is planned, ordered, and traces back to the gaps
it closes.

**Phase 16 — Contract registry and freeze.** Publish authoritative DTO, error,
pagination, and versioning contracts before writing any adapter code. Turns 12 gaps
into tracked documents with tests. No prerequisites. *Start here.*

**Phase 17 — Auth and session lifecycle.** Requires 16. Replaces the hardcoded
`authenticated: true` with a real session contract, adds capability fields
beyond roles, and defines active-context encoding. Closes `gap-01`, `gap-05`, `gap-06`.

**Phase 18 — Backend aggregate endpoints.** Requires 16. Real workspace-scoped
aggregates so cross-domain pages stop needing browser-side relational reconstruction;
server-side pagination. Closes `gap-04`, `gap-03`, and flips
`aggregateContractStatus` from `unresolved` to resolved.

**Phase 19 — Authoritative workflow streaming.** Requires 17. Replaces
`db.workflowScripts` with a real SSE channel carrying event and snapshot state, replay,
and heartbeat. Closes `gap-07`.

**Phase 20 — Signed input pipeline.** Requires 18. Replaces the `mock-upload:` URL
with signed initiation and completion, keeping scan and extraction as distinct states.
Closes `gap-08`.

**Phase 21 — Governed audit and notifications.** Requires 19. Append-only audit with a
stated retention policy, plus a delivery channel. Closes `gap-12`, `gap-09`, `gap-10`.

---

## 10. Working rules

1. **A mock receipt is not a feature.** Anything you add that only produces mock
   receipts should say so in the UI, as the existing surfaces do.
2. **Never claim what you cannot prove.** If a green build is the only evidence, the
   claim is "frontend builds", not "backend connected".
3. **Keep the invariant count at 24 or make it 25.** If your change breaks one, fix the
   code. If it adds a guarantee, add an invariant and a test in the same commit.
4. **Do not infer gap behavior from fixtures.** The fixtures are examples, not specs.
5. **Respect the dependency direction.** `app/` → domains → `shared/`. A domain must
   not import another domain; `shared/` must not import outward.
6. **Regenerate the brain** with `npm run brain` when you add a route, entity, service
   method, invariant, gap, or phase. The graph is a map, and a stale map is worse than
   none. The extractor walks `src/` and `test/` automatically, so new files are picked
   up without editing `brain-extract.mjs`.
7. **Before editing a route, run `npm run brain:query trace <service-id> 2`** to see
   what depends on it.

---

## 11. Query reference

```bash
npm run brain:query stats              # totals
npm run brain:query kind               # node counts per kind
npm run brain:query layer              # the six layers and their modules
npm run brain:query route mcp/models   # route, view, matcher, service, tabs
npm run brain:query entity approval    # fixture, methods, views, caveats
npm run brain:query service            # service surfaces and their risks
npm run brain:query trace svc-p12 2    # downstream impact of a change
npm run brain:query invariant          # the 24 guarantees
npm run brain:query gap                # the 12 gaps and who plans them
npm run brain:query risk               # the 10 risks, most severe first
npm run brain:query phase              # shipped and planned phases
```
