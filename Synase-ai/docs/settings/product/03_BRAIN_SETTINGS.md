# BRAIN — SYNASE AI Settings Product Knowledge

## 1. Mental model
SYNASE is a configurable intelligence system. Settings does not execute work; it defines the policies, preferences and references that the runtime uses to execute work.

**User → Settings → Effective Configuration → Policy Engine → Agent/Tool/Connector Runtime → Audit/Usage**

## 2. Core entities
- User
- Workspace
- Project
- Agent
- Task/Run
- Session
- SettingDefinition
- SettingValue
- Policy
- ModelProvider
- Model
- Tool
- Connector
- CredentialReference
- VaultSource
- Automation
- ApiKey
- AuditEvent
- UsageRecord

## 3. Relationships
`Workspace has Users`  
`Workspace has Projects`  
`Project has Agents`  
`Agent executes Tasks`  
`Agent may use Tools`  
`Tool may require Connector/CredentialReference`  
`Settings produce EffectiveConfiguration`  
`EffectiveConfiguration is constrained by Policies`  
`Mutations produce AuditEvents`

## 4. Scope invariants
1. A lower scope cannot bypass a higher-scope deny.
2. A setting definition explicitly declares allowed scopes.
3. Runtime must never infer scope from UI route alone.
4. Effective configuration must be reproducible from stored values and policy versions.
5. Secret values are not part of ordinary effective-config payloads.

## 5. Permission model
Baseline roles:
- `owner`
- `admin`
- `developer`
- `member`
- `viewer`

Permission families:
`settings.read`, `settings.write`, `settings.security.write`, `models.manage`, `tools.manage`, `connectors.manage`, `keys.manage`, `members.manage`, `workspace.policy.manage`, `data.export`, `data.delete`.

## 6. Secret lifecycle
`requested → created → encrypted/hashed → referenced → rotated/revoked → destroyed`

Secrets must be absent from frontend state where possible after initial submission. API responses use credential metadata/reference IDs.

## 7. Agent autonomy model
Autonomy is a policy dimension, not a single toggle.

`assist`: no autonomous external side effects.  
`guided`: selected actions can execute; confirmation for sensitive actions.  
`autonomous`: allowed actions execute under explicit policy constraints.

The policy engine evaluates:
`actor + workspace + project + agent + task + tool + action + resource + context`.

## 8. Model abstraction
A provider owns connection/configuration. A model is a capability exposed by a provider. Runtime references a normalized model ID and provider adapter.

Provider-specific options belong under an extensible `providerOptions` object and must not pollute the core settings schema.

## 9. Connector/MCP model
A connector is an authorization/configuration object. An MCP server is a tool/context transport endpoint. A connector may expose one or more capabilities/tools.

Settings configures authorization and policy. The dedicated product surface should browse/use connector resources.

## 10. Memory/context model
Memory has two distinct concepts:
- persistent user/project memory;
- ephemeral runtime context.

Compaction affects runtime context; retention affects persistent memory. They must not be represented as the same setting.

## 11. Automation model
Automation = trigger + schedule/condition + execution policy + target + permissions + notification policy + retry/concurrency policy.

No automation may inherit broader permissions than the actor/configuration that created it without an explicit policy grant.

## 12. Audit model
Every security-sensitive mutation records:
`eventId, actorId, scope, action, resourceType, resourceId, result, timestamp, requestId, policyVersion`.
Never record secret values.

## 13. State machines
### Connector
`disconnected → authorizing → connected → degraded/expired → reauth_required → revoked`

### Automation
`draft → active → paused → running → succeeded/failed → disabled`

### API key
`active → revoked → destroyed`

### Setting mutation
`draft → validating → applying → applied | rejected`

## 14. Invariants
- No secret in logs.
- No unauthorized side effect.
- No lower-scope policy override of higher-scope deny.
- No API response may expose one-time secrets after creation.
- Every mutation must be idempotent where retries are possible.
- Every external connector action must have an explicit authorization path.

## 15. ADR index
- ADR-0001: Scope and precedence
- ADR-0002: Secret handling

## 16. Open questions
- Exact existing SYNASE auth provider.
- Existing database choice and schema conventions.
- Existing API routing/versioning convention.
- Existing agent policy engine implementation.
- Exact connector/MCP runtime contract.
- Exact subscription/entitlement model.
