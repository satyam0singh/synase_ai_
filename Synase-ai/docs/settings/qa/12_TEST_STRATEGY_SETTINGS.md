# QA & Test Strategy — Settings

## Unit
- schema validation
- scope resolution
- precedence
- policy merge
- default generation
- secret redaction
- import validation

## Integration
- settings API auth
- optimistic/concurrency conflicts
- connector authorization
- API key creation/revocation
- audit event generation
- data export/delete jobs

## E2E matrix
| Area | Happy path | Denied path | Failure path |
|---|---|---|---|
| General | edit/save | read-only user | server failure |
| Models | select model | unavailable provider | provider outage |
| Agents | change autonomy | workspace deny | policy conflict |
| Memory | enable/disable | policy locked | persistence failure |
| Tools | allow/ask/deny | unauthorized | dependency missing |
| Connectors | connect/revoke | insufficient role | OAuth failure |
| API keys | create/revoke | no permission | duplicate/idempotency |
| Automations | create/pause | policy denied | execution failure |
| Data | export/import | unauthorized | malformed archive |

## Security tests
- IDOR/scope escalation
- CSRF/session checks
- secret exposure in response/logs
- replayed mutation
- privilege escalation
- connector callback validation
- policy bypass through direct API calls

## Accessibility
Automated axe/Lighthouse plus keyboard-only and screen-reader smoke tests. Validate focus trapping in dialogs and readable status changes.
