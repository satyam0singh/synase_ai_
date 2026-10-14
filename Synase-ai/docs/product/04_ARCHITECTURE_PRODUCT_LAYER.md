# Architecture Specification — Product Intelligence Layer

## 1. Architectural constraints inherited from Synase

The current application uses a strict three-layer stack:

```text
app/      composition root
  |
domain/   product, devops, mcp, context, outputs, integrations, work
  |
shared/   api, state, components, services, utils, types
```

The Product domain must not import another domain. Shared imports nothing outside `shared/`. Views do not attach listeners or call APIs. `app/main.js` owns route hydration, event delegation, domain facade calls and state writes.

## 2. Product request lifecycle

```text
URL
  -> router.js
  -> product page composition
  -> pure view template
  -> data-action / data-route intent
  -> app/main.js
  -> productApi facade
  -> shared/api/mock.js or live.js
  -> response envelope
  -> store update
  -> render
```

## 3. Target Product module

```text
src/product/
├── api/
│   └── index.js
├── components/
│   ├── intelligenceHeader.js
│   ├── provenanceBadge.js
│   ├── requirementTable.js
│   ├── requirementDetail.js
│   ├── prioritizationBoard.js
│   ├── strategyPanel.js
│   ├── roadmap.js
│   ├── decisionTrace.js
│   └── emptyStates.js
├── pages/
│   ├── index.js
│   ├── overview.js
│   ├── requirements.js
│   ├── prioritization.js
│   ├── strategy.js
│   ├── roadmap.js
│   └── decisions.js
└── types.d.ts
```

## 4. Page responsibilities

### `pages/index.js`
Composition-only entrypoint. Select the active Product section and compose page chrome/content.

### `pages/overview.js`
Fast product snapshot; no heavy editing behavior.

### `pages/requirements.js`
Requirements inventory, filters, status and requirement detail affordances.

### `pages/prioritization.js`
Feature ranking and score comparison.

### `pages/strategy.js`
Objective, principles and risks.

### `pages/roadmap.js`
Sequenced releases/milestones and dependencies.

### `pages/decisions.js`
Decision history and evidence/provenance tracing.

## 5. Interaction protocol

Use only existing conventions:

- `data-route="/app/..."`
- `data-action="..."`
- `data-tab="..."`
- `data-theme-toggle`

Do not add per-component `addEventListener()` calls.

## 6. State additions

Recommended Product group:

```js
product: {
  requirements: [],
  productFeatures: [],
  productStrategy: null,
  roadmapItems: [],
  decisions: [],
  selectedRequirementId: null,
  selectedFeatureId: null,
  productSection: "overview",
  filters: {
    requirementStatus: "all",
    priority: "all",
    provenance: "all"
  }
}
```

If the existing store is flat rather than namespaced, preserve the current store contract and add only the minimum required keys.

## 7. API facade rule

Only `src/product/api/index.js` should know Product logical routes. `app/main.js` imports that facade; views do not.

## 8. Live vs mock

The same Product facade should work against:

- `shared/api/mock.js` for current development;
- `shared/api/live.js` for eventual backend connectivity.

No Product page should branch directly on transport implementation.

## 9. Security / trust

- Escape interpolated values.
- Preserve recursive redaction semantics.
- Never expose secret/body/header payloads in Product views.
- Keep confirmed and suggested data visually distinct.

## 10. Routing strategy

Preferred routes for the revamp:

```text
/app/intelligence/product
/app/intelligence/product/overview
/app/intelligence/product/requirements
/app/intelligence/product/prioritization
/app/intelligence/product/strategy
/app/intelligence/product/roadmap
/app/intelligence/product/decisions
```

The exact set should be frozen after Drive reconciliation. A single route with tab state remains valid if the source document does not require deep-linking.
