# Settings UI Specification

## Global shell
Desktop layout:
```text
┌───────────────────────────────────────────────────────────────┐
│ SYNASE AI / Settings                              Search      │
├───────────────┬───────────────────────────────────────────────┤
│ Settings      │ Page title                                   │
│ General       │ Description                                   │
│ AI & Models   │                                               │
│ Agents        │ ┌─────────────────────────────────────────┐ │
│ Memory        │ │ Section                                │ │
│ Tools         │ │ Setting label          [control]      │ │
│ Connectors    │ │ Description                            │ │
│ ...           │ └─────────────────────────────────────────┘ │
└───────────────┴───────────────────────────────────────────────┘
```

## Reusable primitives
`SettingsShell`, `SettingsSidebar`, `SettingsSearch`, `SettingsSection`, `SettingRow`, `SettingDescription`, `ToggleField`, `SelectField`, `TextField`, `NumberField`, `SegmentedControl`, `SecretField`, `StatusBadge`, `PolicyLock`, `SaveIndicator`, `DangerZone`, `ConfirmationDialog`, `ConnectionCard`, `KeyTable`, `EmptyState`, `ErrorState`.

## Page patterns
### General
Profile card, locale/time zone, notification section.

### AI & Models
Default model card, provider table, model capability badges, fallback configuration.

### Agents & Autonomy
Autonomy level selector, confirmation policy, side-effect policy, chain limits. Include a plain-language explanation of effective behavior.

### Memory & Context
Memory switch, retention controls, context compaction policy, data controls. Separate persistent memory from ephemeral context.

### Tools & Permissions
Tool table with status and policy: Allowed / Ask / Denied. Workspace-locked settings show lock + explanation.

### Connectors
Connection cards with provider logo/name, status, scopes, Connect/Reauthorize/Disconnect actions. OAuth flow uses a dedicated dialog/page rather than embedding credentials in forms.

### Messaging
Channel cards, delivery preferences, quiet hours if supported.

### Vault & Knowledge
Configuration-only view: allowed sources, indexing/retrieval policy, access scope. Deep-link to the dedicated knowledge resource UI.

### API & Developer
API key table. Creation modal asks for name and scopes. Secret reveal screen is one-time and prominent.

### Automations
Policy controls for schedule, concurrency, retries and notification. Link to dedicated automation builder.

### Usage & Limits
Usage summary, limits, alert thresholds, links to detailed usage surface.

### Security & Privacy
Sessions, privacy choices, export/delete controls, audit access. Destructive actions live in clearly separated danger zone.

### Workspace & Members
Workspace identity, members, roles, policy overview.

### Appearance & Accessibility
Theme, density, reduced motion, contrast/accessibility controls.

### Data & Import/Export
Export job creation, import validation preview, conflict resolution, schema version.

### Advanced
Experimental/diagnostic settings with warnings and feature flags.

## Interaction rules
- Toggle: immediate save where independent.
- Compound form: staged save with explicit Save/Discard.
- Destructive action: confirmation + consequence summary.
- Security-sensitive action: recent-auth challenge when required.
- Policy-locked setting: read-only control + source policy.
- Validation: inline, specific and actionable.
