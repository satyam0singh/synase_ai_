# Brain Specification — Product Intelligence Knowledge Graph

## 1. Purpose

The Product Brain is the structured knowledge representation that connects evidence to product decisions. It must support traceability, retrieval and deterministic mock reasoning without executing external systems.

## 2. Core node types

### Project
`project`

### Requirement
`requirement`

Suggested fields:
- id
- projectId
- title
- type
- priority
- status
- evidenceIds[]
- rationale
- architectureImpact
- provenance
- confidence

### Product Feature
`product_feature`

Suggested fields:
- id
- projectId
- title
- businessValue
- impact
- effort
- risk
- priorityRank
- status
- rationale
- provenance

### Strategy
`product_strategy`

Suggested fields:
- id
- projectId
- objective
- principles[]
- risks[]
- provenance

### Roadmap Item
`roadmap_item`

Suggested fields:
- id
- projectId
- milestone
- release
- sequence
- status
- startDate
- endDate
- dependencyIds[]
- featureIds[]
- requirementIds[]

### Evidence
`evidence`

Suggested fields:
- id
- sourceType
- sourceRef
- excerpt/summary
- timestamp
- confidence
- provenance

### Decision
`product_decision`

Suggested fields:
- id
- projectId
- type
- subjectId
- rationale
- status
- provenance
- evidenceIds[]
- createdAt
- updatedAt

### Risk
`product_risk`

### Release / Milestone
`release`

### Dependency
`dependency`

## 3. Relationship model

```text
PROJECT
  |
  +--has_requirement--> REQUIREMENT
  |                       |
  |                       +--supported_by--> EVIDENCE
  |                       +--impacts--> PRODUCT_FEATURE
  |                       +--constrained_by--> RISK
  |
  +--has_feature-------> PRODUCT_FEATURE
  |                       |
  |                       +--prioritized_as--> PRIORITY / DECISION
  |                       +--scheduled_in--> ROADMAP_ITEM
  |
  +--has_strategy------> PRODUCT_STRATEGY
  |                       |
  |                       +--guides--> PRODUCT_FEATURE
  |                       +--constrained_by--> RISK
  |
  +--has_roadmap_item--> ROADMAP_ITEM
  |                       |
  |                       +--depends_on--> ROADMAP_ITEM
  |                       +--implements--> PRODUCT_FEATURE
  |
  +--has_decision------> PRODUCT_DECISION
                          |
                          +--about--> REQUIREMENT | FEATURE | STRATEGY | ROADMAP_ITEM
                          +--supported_by--> EVIDENCE
```

## 4. Provenance model

Every node carrying generated content should include:

```json
{
  "provenance": "confirmed | ai_suggested",
  "confidence": 0.0
}
```

Do not let a generated suggestion silently overwrite confirmed state.

## 5. Brain invariants

1. All Product nodes must be project-scoped unless they are explicitly global taxonomy nodes.
2. Every AI-suggested node must have a provenance marker.
3. Any decision intended for confirmation should retain links to evidence.
4. Roadmap dependencies must be acyclic in the confirmed state.
5. Priority rank should be deterministic for identical inputs.
6. Brain refresh must be reproducible from fixtures/source documents.

## 6. Query patterns

### Product snapshot
Retrieve:
- active strategy;
- top-ranked features;
- unresolved requirements;
- active roadmap items;
- high-risk dependencies.

### Decision trace
`decision -> subject -> evidence -> source`

### Why-prioritized
`feature -> scoring dimensions -> rationale -> evidence`

### Roadmap rationale
`roadmap item -> feature(s) -> requirement(s) -> strategy principle -> evidence`

## 7. Suggested brain files

```text
brain/product/
├── nodes.schema.json
├── edges.schema.json
├── taxonomy.json
├── fixtures.json
├── invariants.md
└── README.md
```

## 8. Drive Reconciliation Required

The missing source document may define additional domain entities, scoring dimensions, personas, lifecycle states or graph relationships. Merge those before changing the schema.
