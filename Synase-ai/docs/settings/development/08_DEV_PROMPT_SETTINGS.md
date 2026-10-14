# Improved Master Development Prompt — SYNASE AI Settings

You are implementing the **SYNASE AI Settings** product surface inside the existing SYNASE AI codebase.

## Mission
Build a production-quality Settings control plane that is coherent with the existing SYNASE architecture, not a standalone demo. Preserve existing architecture, API conventions, state management, routing, authentication, design system and shared components unless an explicit migration is approved.

## Source hierarchy
1. Existing SYNASE source code and established architecture.
2. Approved SYNASE product documentation in this pack.
3. Existing API/database contracts.
4. Claude screenshots as UX inspiration only.
5. Generic best practices.

Never invent an existing SYNASE capability. If a capability is proposed but not confirmed, label it `PROPOSED` and isolate it behind a feature flag or adapter boundary.

## Mandatory implementation rules
- Keep `app → domain → shared` boundaries intact.
- Use centralized API clients; do not scatter fetch/auth logic through components.
- Keep domain logic out of presentational components.
- Use typed contracts end-to-end.
- Server-side authorization is authoritative.
- Implement deterministic setting scope and precedence.
- Treat secrets as credential references, never ordinary settings.
- Make mutations idempotent where external side effects exist.
- Emit audit events for security-sensitive changes.
- Do not put secrets in logs, analytics, URL parameters or client persistence.
- Preserve backward compatibility unless a migration is specified.

## Required navigation
General → AI & Models → Agents & Autonomy → Memory & Context → Tools & Permissions → Connectors & Integrations → Messaging → Vault & Knowledge → API & Developer → Automations → Usage & Limits → Security & Privacy → Workspace & Members → Appearance & Accessibility → Data & Import/Export → Advanced.

## Required engineering workflow
1. Inspect the existing repository and identify current patterns.
2. Identify reusable shared components/services before creating new ones.
3. Map existing APIs and models to this specification.
4. Produce a reconciliation list for mismatches.
5. Implement the settings shell.
6. Implement the configuration engine and scope resolution.
7. Implement domain pages in dependency order.
8. Add tests at each stage.
9. Run typecheck/lint/unit/integration/E2E as applicable.
10. Report changed files, decisions, unresolved issues and verification results.

## UI requirements
Use a left settings navigation on desktop and a drawer/sheet on mobile. Use clear page titles, sections, descriptions, consistent controls, explicit save state, accessible dialogs and policy explanations. Do not copy Claude's branding or exact wording.

## Before changing code
Check whether the requirement already exists. Prefer extension over duplication. If existing code conflicts with the pack, do not silently rewrite it; document the conflict and choose the smallest safe compatibility change.

## Output for every implementation task
- Files changed.
- APIs changed.
- Schema changes.
- Tests added/updated.
- Security implications.
- Migration implications.
- Remaining risks.
