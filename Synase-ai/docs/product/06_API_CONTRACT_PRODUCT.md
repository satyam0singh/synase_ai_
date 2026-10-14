# API Contract — Product Intelligence Layer

**Status:** Target baseline; reconcile with Drive source before freezing

## 1. Existing contract carried forward

| ID | Method | Route | Purpose |
|---|---|---|---|
| API-48 | `listRequirements(projectId)` | `GET /api/v1/projects/:projectId/requirements` | List project requirements |
| API-49 | `listProductFeatures(projectId)` | `GET /api/v1/projects/:projectId/features` | List product feature candidates |
| API-50 | `getProductStrategy(projectId)` | `GET /api/v1/projects/:projectId/strategy` | Get product strategy |
| API-51 | `listRoadmapItems(projectId)` | `GET /api/v1/projects/:projectId/roadmap` | List roadmap items |
| API-52 | `runProductMock(projectId, action, {idempotencyKey})` | `POST /api/v1/projects/:projectId/intelligence/product/mock-action` | Deterministic mock action |

## 2. Proposed revamp APIs

These are proposed, not claims about the missing Drive document.

### API-88 `getProductOverview(projectId)`
- Logical Route: `GET /api/v1/projects/:projectId/intelligence/product/overview`
- Scope: Project-scoped
- Payload: None
- Idempotency: None
- Response: `{ data: ProductOverview }`
- Mock Behavior: returns a deterministic snapshot assembled from fixture requirements, features, strategy and roadmap.

### API-89 `getRequirement(projectId, requirementId)`
- Logical Route: `GET /api/v1/projects/:projectId/requirements/:requirementId`
- Scope: Project-scoped
- Payload: None
- Idempotency: None
- Response: `{ data: Requirement }`
- Mock Behavior: returns the matching fixture requirement.

### API-90 `listProductDecisions(projectId)`
- Logical Route: `GET /api/v1/projects/:projectId/intelligence/product/decisions`
- Scope: Project-scoped
- Payload: None or pagination/query parameters
- Idempotency: None
- Response: `{ data: ProductDecision[], meta: PageMeta }`
- Mock Behavior: returns deterministic decision fixtures.

### API-91 `getProductDecision(projectId, decisionId)`
- Logical Route: `GET /api/v1/projects/:projectId/intelligence/product/decisions/:decisionId`
- Scope: Project-scoped
- Payload: None
- Idempotency: None
- Response: `{ data: ProductDecisionDetail }`
- Mock Behavior: returns decision plus linked evidence and subject summary.

### API-92 `createProductSuggestion(projectId, payload, {idempotencyKey})`
- Logical Route: `POST /api/v1/projects/:projectId/intelligence/product/suggestions`
- Scope: Project-scoped
- Payload: `{ type, title, rationale, evidenceIds[] }`
- Idempotency: REQUIRED
- Response: `{ data: ProductSuggestionReceipt }`
- Mock Behavior: stores a deterministic suggested artifact; does not alter confirmed project state.

### API-93 `updateRequirement(projectId, requirementId, patch, {idempotencyKey})`
- Logical Route: `PATCH /api/v1/projects/:projectId/requirements/:requirementId`
- Scope: Project-scoped
- Payload: requirement patch
- Idempotency: REQUIRED
- Response: `{ data: Requirement }`
- Mock Behavior: mutates mock fixture state and returns the updated deterministic record.

### API-94 `updateRoadmapItem(projectId, roadmapItemId, patch, {idempotencyKey})`
- Logical Route: `PATCH /api/v1/projects/:projectId/roadmap/:roadmapItemId`
- Scope: Project-scoped
- Payload: roadmap patch
- Idempotency: REQUIRED
- Response: `{ data: RoadmapItem }`
- Mock Behavior: mutates mock roadmap state; no downstream execution.

### API-95 `saveProductStrategy(projectId, payload, {idempotencyKey})`
- Logical Route: `PUT /api/v1/projects/:projectId/intelligence/product/strategy`
- Scope: Project-scoped
- Payload: `{ objective, principles[], risks[] }`
- Idempotency: REQUIRED
- Response: `{ data: ProductStrategy }`
- Mock Behavior: replaces mock strategy state; no downstream execution.

## 3. Canonical response envelope

Success:

```json
{ "data": {} }
```

Paginated success:

```json
{
  "data": [],
  "meta": { "page": 1, "pageSize": 25, "total": 100 }
}
```

Error:

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product artifact not found",
    "status": 404,
    "requestId": "req_...",
    "details": {}
  }
}
```

## 4. Idempotency

Every mutating method must receive:

```js
{ idempotencyKey: createIdempotencyKey() }
```

Replaying the same key must return the identical saved receipt.

## 5. Product types

### Requirement

```ts
interface Requirement {
  id: string;
  projectId: string;
  title: string;
  type: string;
  priority: 'critical'|'high'|'medium'|'low'|'deferred';
  status: 'identified'|'clarified'|'approved'|'in_progress'|'implemented'|'validated'|'rejected'|'archived';
  evidence: string[];
  rationale?: string;
  architectureImpact?: string;
  provenance: 'confirmed'|'ai_suggested';
  confidence?: number;
}
```

### ProductFeature

```ts
interface ProductFeature {
  id: string;
  projectId: string;
  title: string;
  businessValue: number | string;
  impact: number | string;
  effort: number | string;
  risk: number | string;
  priorityRank: number;
  status: string;
  rationale: string;
  provenance: 'confirmed'|'ai_suggested';
}
```

### ProductStrategy

```ts
interface ProductStrategy {
  objective: string;
  principles: string[];
  risks: string[];
  provenance: 'confirmed'|'ai_suggested';
}
```

### RoadmapItem

```ts
interface RoadmapItem {
  id: string;
  projectId: string;
  milestone: string;
  release: string;
  sequence: number;
  status: 'planned'|'active'|'completed'|'delayed'|'cancelled';
  startDate?: string;
  endDate?: string;
  dependencies: string[];
}
```

## 6. Drive Reconciliation Required

Freeze endpoint names, scoring fields, mutation semantics and additional Product entities only after comparing this document with the inaccessible Drive source.
