# Master Development Prompt — Synase AI Product Intelligence Layer

Use this prompt with a coding agent after attaching the exported Product Layer source document.

---

You are implementing the **PRODUCT INTELLIGENCE LAYER revamp of SYNASE AI**.

## Authoritative sources and precedence

Use sources in this order:

1. The attached Product Layer requirements/design document — authoritative for Product-specific behavior and UX.
2. The existing Synase project handoff/context file — authoritative for architecture, conventions and compatibility boundaries.
3. Existing repository code, tests and `ALL_APIs.TXT` — authoritative for current implementation contracts unless explicitly superseded by source #1.
4. General engineering knowledge — use only to resolve underspecified implementation mechanics; never invent Product requirements.

Do not silently reconcile contradictions. Create a `SOURCE_RECONCILIATION.md` note when the Product document conflicts with existing architecture/API behavior.

## Project context

SYNASE AI is a decision-intelligence console for software teams. Product Intelligence covers requirements, prioritization, strategy and roadmap. Current workflows are MOCK ONLY: do not invoke real models, MCP tools, pipelines, third-party APIs or deployments.

Current frontend architecture is:

```text
app/ -> domain/ -> shared/
```

Hard rules:

- A domain must never import another domain.
- `shared/` imports nothing outside itself.
- `app/main.js` is the composition root.
- There is one router.
- There is one delegated event listener set.
- Views are pure HTML template functions.
- Views never call APIs.
- Views never attach event listeners.
- UI intent is expressed with `data-route`, `data-action`, `data-tab` and similar attributes.
- Every interpolated value is escaped.
- Mutations require idempotency keys.
- API responses use `{ data }` or `{ data, meta }` envelopes.
- Preserve structured `ApiError` handling.
- Keep `confirmed` and `ai_suggested` provenance visually distinct.
- Approval is not execution.

## Objective

Revamp the Product Intelligence layer into a production-quality, decision-oriented product surface while preserving all existing architectural guarantees and without breaking unrelated domains.

## Required deliverables

### A. Product UX/UI
Implement every screen/workflow specified by the attached Product document.

Use dedicated files under:

```text
src/product/pages/
src/product/components/
src/styles/product/
```

Prefer section routes when the requirements demand deep-linking; otherwise retain a tabbed route.

### B. Product API
Implement Product methods exactly once in:

```text
src/shared/api/mock.js
src/shared/api/live.js
src/product/api/index.js
```

Do not make views aware of transport details.

Document every new endpoint in `ALL_APIs.TXT` using the existing `[API-NN]` format and continue numbering consistently.

### C. State
Extend the existing plain-object store only with fields required by the Product requirements.

### D. Brain
Implement Product knowledge-graph nodes, edges, invariants and deterministic fixtures under:

```text
brain/product/
```

Ensure Product decisions are traceable through evidence and provenance.

### E. Tests
Add contract tests for:

- every Product API method;
- idempotency replay;
- provenance behavior;
- mock non-execution;
- page rendering for empty/loading/error/normal states;
- route navigation;
- state updates.

## UX requirements

- Editorial, restrained visual hierarchy.
- Existing Synase tokens only.
- Square/minimal corner radii.
- Full light/dark support.
- Clear confirmed vs AI-suggested distinction.
- Dense enough for serious product work, but with strong information hierarchy.
- Avoid decorative UI that obscures decision content.
- Prefer explicit evidence, rationale, scoring and dependencies over generic AI copy.

## Data trust requirements

For every generated or inferred artifact:

- expose provenance;
- expose confidence where specified;
- preserve evidence references;
- never silently promote suggestions into confirmed state.

## Development workflow

1. Read the attached Product source completely.
2. Extract every requirement into a traceability table.
3. Compare it with the existing Product baseline.
4. Freeze terminology and data contracts.
5. Implement the smallest compatible architecture change.
6. Preserve old behavior until new behavior is verified.
7. Run tests after each logical phase.
8. Run build and brain regeneration before completion.

## Completion report

At the end, report:

- files created/changed;
- routes added/changed;
- API IDs added/changed;
- store fields added/changed;
- brain node/edge changes;
- tests added;
- test/build result;
- unresolved source conflicts;
- any Product requirements that could not be implemented without inventing behavior.

Never claim a requirement is implemented unless it is backed by the source document or existing repository behavior.
