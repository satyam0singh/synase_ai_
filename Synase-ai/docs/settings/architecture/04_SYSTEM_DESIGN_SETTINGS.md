# System Design — SYNASE AI Settings

## Architecture
```text
Web UI
  ↓
Settings Client / Query Cache
  ↓
Settings API
  ├── Config Service
  ├── Policy/Authorization Service
  ├── Provider Registry
  ├── Connector Service
  ├── Secret/Credential Service
  ├── Automation Service
  ├── Usage Service
  └── Audit Service
        ↓
Database / Secret Store / Event Bus / External Providers
```

## Frontend
Recommended boundaries:
- `settings-shell`
- `settings-navigation`
- `settings-page`
- `setting-field`
- `settings-form`
- `policy-explanation`
- `secret-dialog`
- `connection-status`
- `confirmation-dialog`

The UI must call domain APIs through a centralized API client. Components must not construct raw authorization headers or provider URLs.

## Backend
Use domain modules rather than route-centric business logic.

`settings` owns configuration CRUD.  
`policy` owns effective permission evaluation.  
`credentials` owns secret references.  
`connectors` owns provider authorization.  
`audit` records security mutations.

## Database entities
Core tables/collections:
- `settings_definitions`
- `settings_values`
- `policies`
- `users`
- `workspaces`
- `projects`
- `agents`
- `providers`
- `models`
- `tools`
- `connectors`
- `credential_refs`
- `api_keys`
- `automations`
- `audit_events`
- `usage_records`

## Effective configuration algorithm
1. Load allowed setting definitions.
2. Determine actor and target scope.
3. Load values for permitted scopes.
4. Merge by deterministic precedence.
5. Apply policy restrictions.
6. Validate final configuration against schema.
7. Return effective values plus optional provenance metadata.

## Provenance
For advanced/debug views, return:
`effectiveValue`, `sourceScope`, `sourceId`, `policyConstraints`, `definitionVersion`.

Do not expose sensitive provenance that reveals secret material.

## Caching
Cache non-secret effective settings. Invalidate on mutation. Never cache plaintext credentials in browser persistent storage.

## Observability
Metrics:
- settings read latency
- settings write latency
- validation failures
- policy denials
- connector auth failures
- secret-store failures
- automation failures
- export/delete job latency

Logs must use structured redaction.

## Threat model
Primary threats:
- privilege escalation through scope manipulation
- secret exfiltration
- unauthorized connector use
- confused-deputy agent execution
- replayed mutation requests
- CSRF/session theft
- policy bypass through client-side flags
- audit tampering

Controls: server-side authorization, idempotency keys, secure sessions, encrypted secret storage, strict schemas, immutable audit append, policy evaluation before side effects.
