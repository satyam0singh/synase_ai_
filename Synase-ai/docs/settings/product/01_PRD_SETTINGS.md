# PRD — SYNASE AI Settings

**Status:** Development-ready baseline  
**Product:** SYNASE AI  
**Surface:** Settings  
**Priority:** P0 foundation / P1 expansion

## 1. Product vision
SYNASE Settings is the control plane through which a user understands and configures how SYNASE behaves: its models, agents, memory, tools, connectors, permissions, messaging, knowledge, automation, security, and personal/workspace preferences.

Settings must expose **control without requiring users to understand the underlying implementation** while still providing advanced controls for developers and administrators.

## 2. Problem
AI products accumulate configuration across models, prompts, memory, tools, integrations, permissions and execution policies. If these controls are scattered, users cannot answer:
- What is SYNASE allowed to do?
- Which model/provider will execute this task?
- What information can it remember or access?
- Which external systems are connected?
- Which scope owns a setting?
- Why did a configuration take effect?

SYNASE needs a single, coherent configuration surface with deterministic behavior and safe defaults.

## 3. Goals
- Provide one discoverable settings control plane.
- Establish deterministic configuration scope and precedence.
- Make agent/tool autonomy explicit and least-privilege by default.
- Secure credentials and secrets.
- Make model/provider configuration understandable.
- Support personal, workspace and project-level configuration.
- Make configuration auditable and reversible where practical.
- Provide a stable contract for frontend, API and future agents.

## 4. Non-goals
- Rebuilding the core agent runtime.
- Turning Settings into a full connector marketplace.
- Building a full knowledge-browser UI inside Settings.
- Copying Claude's proprietary UI, terminology, branding or implementation.
- Implementing enterprise billing before the underlying entitlement model exists.

## 5. Product principles
1. **Configuration is typed state, not UI state.**
2. **Every setting has an owner scope.**
3. **More dangerous capability requires more explicit authorization.**
4. **Secrets are references, never ordinary configuration values.**
5. **Effective configuration must be explainable.**
6. **Defaults should minimize accidental data exposure and side effects.**
7. **Settings should configure resources; dedicated product surfaces should operate them.**
8. **Unknown/unsupported settings must fail safely rather than silently applying.**

## 6. Canonical information architecture
### Core
1. General
2. AI & Models
3. Agents & Autonomy
4. Memory & Context
5. Tools & Permissions
6. Connectors & Integrations
7. Messaging
8. Vault & Knowledge
9. API & Developer
10. Automations
11. Usage & Limits
12. Security & Privacy
13. Workspace & Members
14. Appearance & Accessibility
15. Data & Import/Export
16. Advanced

### Navigation rationale
- **General** contains low-risk personal behavior.
- **AI & Models** owns model/provider behavior.
- **Agents & Autonomy** owns agent execution policies.
- **Memory & Context** owns retention and context behavior.
- **Tools & Permissions** owns capabilities and authorization.
- **Connectors** owns external-system authorization state.
- **Messaging** owns delivery/channel behavior.
- **Vault & Knowledge** configures knowledge sources without becoming the resource browser.
- **API & Developer** contains API keys, webhooks, developer settings.
- **Automations** configures scheduling/triggers.
- **Usage & Limits** makes resource consumption visible and controllable.
- **Security & Privacy** owns security posture and privacy controls.
- **Workspace & Members** owns collaboration/RBAC.
- **Appearance** owns visual/accessibility preferences.
- **Data** owns export/import.
- **Advanced** contains expert-only and diagnostic controls.

## 7. Scope model
Supported scopes:
- `system` — installation/operator controlled; not user-editable in hosted product.
- `workspace` — organization/workspace policy.
- `project` — project-specific behavior.
- `agent` — agent-specific override.
- `task` — task/run-specific override.
- `session` — transient runtime override.
- `user` — personal preference.

### Precedence
`system > workspace > project > agent > task > session` for policy restrictions, while user preferences apply only where the schema explicitly permits user override.

For a normal behavioral setting, the effective value is resolved from the most specific permitted scope that exists. A higher-level deny/restriction may not be overridden by a lower-level allow.

## 8. Configuration requirement format
Every setting MUST define:
- `id`
- `label`
- `description`
- `type`
- `default`
- `scope`
- `sensitivity`
- `validation`
- `dependencies`
- `permission`
- `resetBehavior`
- `auditBehavior`

## 9. Domain requirements
### General — SET-GEN
- Profile display name.
- Language.
- Time zone.
- Default landing surface.
- Notification preferences.
- Default confirmation behavior for low-risk actions.

### AI & Models — SET-AI
- Default provider.
- Default model.
- Model fallback policy.
- Temperature/creativity where provider/model supports it.
- Reasoning/effort profile where supported.
- Max output policy.
- Provider availability/status.
- Custom provider registration for authorized developers.

### Agents & Autonomy — SET-AGT
- Default agent mode.
- Autonomy level: `assist`, `guided`, `autonomous`.
- Human confirmation policy.
- Maximum tool/action chain length.
- Side-effect policy.
- Failure/retry policy.
- Agent-specific overrides.

### Memory & Context — SET-MEM
- Memory enabled.
- Memory categories allowed.
- Retention policy.
- Context compaction strategy.
- Context window policy.
- User memory inspection/export/delete entry points.
- Per-agent memory access.

### Tools & Permissions — SET-TLS
- Tool enablement.
- Tool permission mode: `deny`, `ask`, `allow`.
- Network access.
- Code execution.
- File access.
- External side effects.
- Tool allow/deny rules.
- Workspace policy enforcement.

### Connectors & Integrations — SET-CON
- Connector catalog/configuration.
- Connection status.
- OAuth/API credential mode.
- Granted scopes.
- Re-authentication.
- Disconnect/revoke.
- Connector-specific permissions.
- MCP endpoint registration where supported.

### Messaging — SET-MSG
- Enabled channels.
- Default channel.
- Delivery preferences.
- Notification rules.
- Channel-specific authorization.

### Vault & Knowledge — SET-VLT
- Default knowledge policy.
- Allowed sources.
- Indexing policy.
- Retrieval limits.
- Knowledge access by agent/project.
- Vault credential references.

### API & Developer — SET-API
- API key creation/revocation.
- Key names and bounded scopes.
- Webhook configuration.
- API version preference if applicable.
- Developer mode.
- Request/debug visibility.

API keys MUST be revealed only at creation when the secret cannot be recovered; subsequent views show metadata only.

### Automations — SET-AUT
- Automation enablement.
- Trigger policies.
- Schedule/time zone.
- Execution permissions.
- Notification on success/failure.
- Concurrency and retry policy.

### Usage & Limits — SET-USG
- Current usage.
- Token/request/tool consumption where available.
- Workspace/project limits.
- Alert thresholds.
- Runtime budget controls.

### Security & Privacy — SET-SEC
- Session/security controls.
- Active sessions.
- MFA/SSO hooks where supported.
- Privacy preferences.
- Analytics consent.
- Data retention.
- Export/delete requests.
- Audit visibility.

### Workspace & Members — SET-WKS
- Workspace identity.
- Members.
- Roles.
- Invitations.
- Workspace policy controls.
- SSO/SCIM placeholders only if supported by platform architecture.

### Appearance & Accessibility — SET-APP
- Theme.
- Accent/density if supported.
- Reduced motion.
- Contrast/accessibility preferences.
- Compact/comfortable density.

### Data & Import/Export — SET-DAT
- Export configuration/data.
- Import validated configuration.
- Backup/restore where supported.
- Schema version.
- Import preview and conflict resolution.

### Advanced — SET-ADV
- Experimental features.
- Diagnostic mode.
- Feature flags visible only to authorized users.
- Configuration reset.
- Runtime metadata.

## 10. UX requirements
- Desktop: persistent left settings navigation + scrollable content pane.
- Mobile: collapsible navigation/drawer.
- Search settings globally.
- Deep links for each setting page.
- Unsaved state must be explicit if a page uses staged saves.
- Prefer immediate save for isolated toggles; use staged save for compound forms.
- Show saving/saved/error state.
- Destructive operations require confirmation.
- Sensitive actions may require recent authentication.
- Every disabled control must explain why when disabled by policy/dependency.

## 11. States
Every page must support:
`loading`, `ready`, `saving`, `saved`, `validation_error`, `permission_denied`, `dependency_unavailable`, `empty`, `server_error`, `offline/stale` where relevant.

## 12. Accessibility
Target WCAG 2.2 AA. Keyboard navigation, visible focus, semantic labels, accessible dialogs, non-color-only state indication and reduced-motion support are mandatory.

## 13. Telemetry
Events should be privacy-minimized and include:
- `settings_page_viewed`
- `setting_changed`
- `setting_save_failed`
- `setting_reset`
- `connector_connected`
- `connector_disconnected`
- `api_key_created`
- `api_key_revoked`
- `permission_policy_changed`
- `export_requested`
- `delete_requested`
No secret values may enter telemetry.

## 14. MVP
### P0
General, Appearance, AI & Models, Agents & Autonomy baseline, Memory & Context baseline, Tools & Permissions baseline, Connectors framework, Security baseline, API keys, Data export/import foundation.

### P1
Messaging, Vault/Knowledge configuration, Automations, Usage/limits, Workspace members/RBAC.

### P2
Enterprise SSO/SCIM, advanced policy simulator, advanced diagnostics, richer provider routing, policy-as-code.

## 15. Acceptance criteria examples
**SET-AGT-001**  
Given an agent has autonomous mode enabled, when it attempts a configured side-effect tool, then the policy engine must evaluate authorization before execution and either allow, deny, or request confirmation.

**SET-API-001**  
Given a user creates an API key, when creation succeeds, then the plaintext secret is shown once and is never returned by a normal list/get endpoint.

**SET-CON-001**  
Given a connector is disconnected, when disconnect completes, then its active credential reference is revoked/invalidated and the UI reflects the disconnected state.

**SET-MEM-001**  
Given memory is disabled, when a new interaction completes, then no new user memory may be persisted by the memory subsystem.
