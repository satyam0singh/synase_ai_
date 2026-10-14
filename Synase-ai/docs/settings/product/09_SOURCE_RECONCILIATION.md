# Source Reconciliation — SYNASE AI Settings

## Classification
| Source | Authority | Use |
|---|---|---|
| Existing SYNASE code | Highest | Actual implementation truth |
| Approved SYNASE docs | High | Product/architecture intent |
| Existing API contracts | High | Integration truth |
| Claude screenshots | Reference | UX pattern inspiration |
| Generic web research | Supporting | Standards/patterns |

## Confirmed from project context
- SYNASE is being developed as an AI/product intelligence platform with distinct product surfaces.
- The current frontend is being structurally separated into product areas and shared context.
- Agentic AI, MCP, RAG/context and automation are relevant architectural concepts.
- The user wants Settings to be a first-class product surface.

## Reference-derived, not confirmed
- Exact Claude navigation labels.
- Exact Claude control defaults.
- Exact subscription tiers.
- Exact OAuth provider list.
- Exact enterprise IAM provider.
- Exact database schema.

## Reconciliation required before production
1. Existing route structure.
2. Existing API base client.
3. Existing authentication/session model.
4. Existing state/query library.
5. Existing database/ORM.
6. Existing agent policy engine.
7. Existing MCP implementation.
8. Existing secret/credential storage.
9. Existing telemetry/audit conventions.
10. Existing billing/entitlement service.

## Rule
Where implementation differs from this pack, retain existing architecture unless the difference creates a security or correctness problem. Update this reconciliation document and relevant ADR rather than creating undocumented parallel systems.
