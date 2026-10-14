# Product Layer Source Reconciliation

## Current source availability

### Available
- Synase project handoff / progress context.

### Unavailable
- Google Drive Product Layer source document referenced by the user.

The Drive source could not be retrieved in the current session. This file exists so the final Product specification can be reconciled without silently inventing requirements.

## Reconciliation matrix

| Topic | Existing Synase baseline | Drive source | Decision |
|---|---|---|---|
| Product sections | Requirements, Prioritization, Strategy, Roadmap | PENDING | PENDING |
| Product routes | `/app/intelligence/product` | PENDING | PENDING |
| Requirements fields | id/title/type/priority/status/evidence/rationale/architectureImpact/provenance/confidence | PENDING | PENDING |
| Feature scoring | value/impact/effort/risk/rank | PENDING | PENDING |
| Strategy | objective/principles/risks/provenance | PENDING | PENDING |
| Roadmap | milestone/release/sequence/status/dates/dependencies | PENDING | PENDING |
| Mock behavior | no external invocation | PENDING | PENDING |
| Provenance | confirmed vs ai_suggested | PENDING | PENDING |
| Mutation safety | idempotency required | PENDING | PENDING |
| Brain schema | existing graph + Product nodes | PENDING | PENDING |
| Acceptance criteria | handoff-level baseline | PENDING | PENDING |

## Rule
Any item marked PENDING must be filled from the actual Product source before being treated as final requirements.
