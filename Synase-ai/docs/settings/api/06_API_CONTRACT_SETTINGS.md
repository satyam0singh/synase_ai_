# API Contract — SYNASE AI Settings

**Style:** REST + JSON  
**Base:** `/api/v1`

## Settings
`GET /settings` — effective settings for current target scope.  
`GET /settings/definitions` — allowed definitions.  
`PATCH /settings/{settingId}` — update one setting.  
`POST /settings/reset` — reset selected settings.

### PATCH example
```json
{
  "scope": "user",
  "value": "dark",
  "expectedVersion": 12,
  "idempotencyKey": "idem-..."
}
```

## Providers/models
`GET /providers`  
`POST /providers`  
`DELETE /providers/{id}`  
`GET /models`

## Agents/policies
`GET /agents/{id}/policy`  
`PATCH /agents/{id}/policy`  
`POST /policy/evaluate`

Policy evaluation should be internal-only unless an explicit diagnostic endpoint is authorized.

## Tools
`GET /tools`  
`GET /tools/{id}/policy`  
`PATCH /tools/{id}/policy`

## Connectors
`GET /connectors`  
`POST /connectors/{provider}/authorize`  
`GET /connectors/callback`  
`POST /connectors/{id}/reauthorize`  
`DELETE /connectors/{id}`

## API keys
`GET /api-keys` returns metadata only.  
`POST /api-keys` returns the secret exactly once.  
`DELETE /api-keys/{id}` revokes the key.

### Create response
```json
{
  "id": "key_123",
  "name": "local-dev",
  "scopes": ["runs:read"],
  "secret": "ONE_TIME_SECRET",
  "secretShownOnce": true
}
```

## Automations
`GET /automations`  
`POST /automations`  
`PATCH /automations/{id}`  
`POST /automations/{id}/pause`  
`POST /automations/{id}/resume`  
`DELETE /automations/{id}`

## Usage
`GET /usage`  
`GET /usage/limits`

## Data transfer
`POST /data/export`  
`GET /data/export/{jobId}`  
`POST /data/import/validate`  
`POST /data/import/apply`  
`POST /data/delete-request`

## Error format
```json
{
  "error": {
    "code": "POLICY_DENIED",
    "message": "This setting is controlled by workspace policy.",
    "requestId": "req_123",
    "details": {}
  }
}
```

Codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `POLICY_DENIED`, `DEPENDENCY_UNAVAILABLE`, `RATE_LIMITED`, `INTERNAL_ERROR`.

## Authorization
Every mutation is authorized server-side. UI hiding is not authorization.

## Idempotency
All mutation endpoints that create external side effects or credentials accept `Idempotency-Key`.
