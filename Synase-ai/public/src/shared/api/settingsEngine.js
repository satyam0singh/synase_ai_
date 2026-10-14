// @ts-check
/**
 * SYNASE AI — Shared Settings Registry & Scope Resolver
 * Lives in shared/api/ to adhere strictly to the rule: "shared/ imports nothing outside itself".
 */

export const SCOPE_PRECEDENCE = [
  'system',
  'workspace',
  'project',
  'agent',
  'task',
  'session',
  'user'
];

/** @type {Array<import("../types/types.d.ts").SettingDefinition>} */
export const settingsRegistry = [
  // ── 1. General ──
  {
    id: "general.profile_name",
    section: "general",
    label: "Display Name",
    description: "The name presented on decision reports and approval signatures.",
    type: "string",
    default: "Alex Turner",
    allowedScopes: ["user"],
    sensitivity: "public",
    schemaVersion: 1
  },
  {
    id: "general.timezone",
    section: "general",
    label: "Primary Time Zone",
    description: "Time zone used for audit timestamps and scheduled automation runs.",
    type: "enum",
    default: "UTC",
    options: [
      { label: "UTC (Coordinated Universal Time)", value: "UTC" },
      { label: "America/New_York (EST)", value: "America/New_York" },
      { label: "America/Los_Angeles (PST)", value: "America/Los_Angeles" },
      { label: "Europe/London (GMT/BST)", value: "Europe/London" },
      { label: "Asia/Tokyo (JST)", value: "Asia/Tokyo" }
    ],
    allowedScopes: ["user", "workspace"],
    sensitivity: "public",
    schemaVersion: 1
  },
  {
    id: "general.email_notifications",
    section: "general",
    label: "Email Activity Digest",
    description: "Receive critical security and approval notices via email.",
    type: "boolean",
    default: true,
    allowedScopes: ["user"],
    sensitivity: "public",
    schemaVersion: 1
  },

  // ── 2. AI & Models ──
  {
    id: "ai.default_model",
    section: "ai-models",
    label: "Primary Decision Model",
    description: "Default foundation model used for reasoning workflows and synthesis.",
    type: "enum",
    default: "gemini-1.5-pro",
    options: [
      { label: "Gemini 1.5 Pro (Deep Research & High Context)", value: "gemini-1.5-pro" },
      { label: "Claude 3.5 Sonnet (Elite Code & UX Analysis)", value: "claude-3-5-sonnet" },
      { label: "GPT-4o (Multimodal & Fast Synthesis)", value: "gpt-4o" },
      { label: "Local Ollama Llama 3 (Air-gapped / Private)", value: "llama3-local" }
    ],
    allowedScopes: ["workspace", "project"],
    sensitivity: "internal",
    schemaVersion: 1
  },
  {
    id: "ai.fallback_provider",
    section: "ai-models",
    label: "Automatic Provider Fallback",
    description: "Switch to secondary model provider if primary experiences rate limits or outages.",
    type: "boolean",
    default: true,
    allowedScopes: ["workspace"],
    sensitivity: "internal",
    schemaVersion: 1
  },
  {
    id: "ai.temperature",
    section: "ai-models",
    label: "Reasoning Determinism (Temperature)",
    description: "Lower values produce strictly deterministic, repeatable decisions.",
    type: "number",
    default: 0.2,
    allowedScopes: ["workspace", "project"],
    sensitivity: "internal",
    schemaVersion: 1
  },

  // ── 3. Agents & Autonomy ──
  {
    id: "agents.autonomy_level",
    section: "agents",
    label: "Default Autonomy Level",
    description: "Defines the degree of independence agents have before requesting human approval.",
    type: "enum",
    default: "supervised",
    options: [
      { label: "Assisted (Read-only observation, zero proactive actions)", value: "assist" },
      { label: "Supervised (Proposes structured actions; human must approve)", value: "supervised" },
      { label: "Autonomous (Self-executes verified low-risk tasks)", value: "autonomous" }
    ],
    allowedScopes: ["workspace", "project"],
    sensitivity: "internal",
    schemaVersion: 1
  },
  {
    id: "agents.confirmation_policy",
    section: "agents",
    label: "Action Confirmation Policy",
    description: "Determines which tool invocations require an explicit cryptographic signature.",
    type: "enum",
    default: "sensitive_only",
    options: [
      { label: "Always Prompt (Confirm every tool invocation)", value: "always" },
      { label: "Sensitive Only (Prompt for writes, deletions, and deploys)", value: "sensitive_only" },
      { label: "Policy Controlled (Evaluate against RBAC matrix)", value: "policy" }
    ],
    allowedScopes: ["workspace", "project"],
    sensitivity: "internal",
    schemaVersion: 1
  },
  {
    id: "agents.max_chain_steps",
    section: "agents",
    label: "Max Autonomous Step Chain",
    description: "Maximum consecutive automated sub-agent invocations before halting for verification.",
    type: "number",
    default: 25,
    allowedScopes: ["workspace", "project"],
    sensitivity: "internal",
    schemaVersion: 1
  },

  // ── 4. Memory & Context ──
  {
    id: "memory.enabled",
    section: "memory",
    label: "Cross-Session Semantic Memory",
    description: "Enable ChromaDB vector memory for remembering previous project findings.",
    type: "boolean",
    default: true,
    allowedScopes: ["workspace", "project"],
    sensitivity: "sensitive",
    schemaVersion: 1
  },
  {
    id: "memory.retention_days",
    section: "memory",
    label: "Memory Retention Window",
    description: "Days before inactive semantic memories and embeddings are pruned.",
    type: "enum",
    default: "90",
    options: [
      { label: "30 Days (Ephemeral compliance)", value: "30" },
      { label: "90 Days (Standard cycle)", value: "90" },
      { label: "365 Days (Full compliance year)", value: "365" },
      { label: "Indefinite (Persistent archive)", value: "0" }
    ],
    allowedScopes: ["workspace"],
    sensitivity: "sensitive",
    schemaVersion: 1
  },
  {
    id: "memory.auto_compact",
    section: "memory",
    label: "Automatic Context Compaction",
    description: "Automatically summarize long conversational traces when exceeding 80% context window.",
    type: "boolean",
    default: true,
    allowedScopes: ["workspace", "project"],
    sensitivity: "internal",
    schemaVersion: 1
  },

  // ── 5. Tools & Permissions ──
  {
    id: "tools.shell_execution",
    section: "tools",
    label: "Shell Command Execution",
    description: "Allow runtime execution of read-only terminal inspection commands.",
    type: "enum",
    default: "ask",
    options: [
      { label: "Allowed (Permit safe commands)", value: "allow" },
      { label: "Ask (Prompt user before each run)", value: "ask" },
      { label: "Denied (Completely disabled)", value: "deny" }
    ],
    allowedScopes: ["workspace", "project"],
    sensitivity: "sensitive",
    schemaVersion: 1
  },
  {
    id: "tools.file_mutation",
    section: "tools",
    label: "Source Code Modification",
    description: "Permit agents to propose direct diffs to repository source files.",
    type: "enum",
    default: "ask",
    options: [
      { label: "Allowed", value: "allow" },
      { label: "Ask", value: "ask" },
      { label: "Denied", value: "deny" }
    ],
    allowedScopes: ["workspace", "project"],
    sensitivity: "sensitive",
    schemaVersion: 1
  },

  // ── 6. Connectors & Integrations ──
  {
    id: "connectors.auto_sync",
    section: "connectors",
    label: "Continuous Telemetry Synchronization",
    description: "Periodically poll connected GitHub, Jira, and Linear sources for new commits & issues.",
    type: "boolean",
    default: true,
    allowedScopes: ["workspace"],
    sensitivity: "internal",
    schemaVersion: 1
  },
  {
    id: "connectors.sync_interval_mins",
    section: "connectors",
    label: "Sync Polling Frequency",
    description: "Time interval in minutes between background synchronization cycles.",
    type: "number",
    default: 15,
    allowedScopes: ["workspace"],
    sensitivity: "internal",
    schemaVersion: 1
  },

  // ── 7. Messaging ──
  {
    id: "messaging.slack_notify",
    section: "messaging",
    label: "Slack Channel Webhooks",
    description: "Broadcast completed decision reports and approval gates to team channels.",
    type: "boolean",
    default: false,
    allowedScopes: ["workspace", "project"],
    sensitivity: "public",
    schemaVersion: 1
  },
  {
    id: "messaging.quiet_hours_enabled",
    section: "messaging",
    label: "Quiet Hours Policy",
    description: "Silence non-critical notification events between 20:00 and 08:00 local time.",
    type: "boolean",
    default: true,
    allowedScopes: ["user"],
    sensitivity: "public",
    schemaVersion: 1
  },

  // ── 8. Vault & Knowledge ──
  {
    id: "vault.chunk_size",
    section: "vault",
    label: "Document Chunk Window Size",
    description: "Token chunk length when ingesting PRDs, specs, and architectural RFCs.",
    type: "number",
    default: 512,
    allowedScopes: ["workspace"],
    sensitivity: "internal",
    schemaVersion: 1
  },
  {
    id: "vault.auto_reindex",
    section: "vault",
    label: "Automated Knowledge Re-indexing",
    description: "Automatically index newly merged pull requests into the project knowledge graph.",
    type: "boolean",
    default: true,
    allowedScopes: ["project"],
    sensitivity: "internal",
    schemaVersion: 1
  },

  // ── 9. API & Developer ──
  {
    id: "developer.debug_mode",
    section: "developer",
    label: "Console Diagnostics & Wire Tracing",
    description: "Display raw SSE frames, JSON payloads, and MCP trace envelopes in UI drawers.",
    type: "boolean",
    default: false,
    allowedScopes: ["user"],
    sensitivity: "internal",
    schemaVersion: 1
  },
  {
    id: "developer.mock_delay_ms",
    section: "developer",
    label: "Simulated Network Latency",
    description: "Artificial sleep delay (in ms) applied to mock adapter API calls.",
    type: "number",
    default: 200,
    allowedScopes: ["user"],
    sensitivity: "internal",
    schemaVersion: 1
  },

  // ── 10. Automations ──
  {
    id: "automations.concurrency_limit",
    section: "automations",
    label: "Parallel Task Execution Limit",
    description: "Maximum simultaneous asynchronous analysis tasks per project.",
    type: "number",
    default: 4,
    allowedScopes: ["workspace"],
    sensitivity: "internal",
    schemaVersion: 1
  },
  {
    id: "automations.pause_on_error",
    section: "automations",
    label: "Halt Pipeline on Error",
    description: "Immediately pause all downstream tasks if a lint or vulnerability check fails.",
    type: "boolean",
    default: true,
    allowedScopes: ["workspace", "project"],
    sensitivity: "internal",
    schemaVersion: 1
  },

  // ── 11. Usage & Limits ──
  {
    id: "usage.monthly_token_cap",
    section: "usage",
    label: "Monthly Token Quota (Millions)",
    description: "Safety ceiling for LLM inference tokens consumed across the workspace.",
    type: "number",
    default: 50,
    allowedScopes: ["workspace"],
    sensitivity: "sensitive",
    schemaVersion: 1
  },
  {
    id: "usage.budget_alert_threshold",
    section: "usage",
    label: "Budget Alert Notification (%)",
    description: "Notify admins when token consumption reaches this percentage of the ceiling.",
    type: "number",
    default: 80,
    allowedScopes: ["workspace"],
    sensitivity: "internal",
    schemaVersion: 1
  },

  // ── 12. Security & Privacy ──
  {
    id: "security.mfa_enforced",
    section: "security",
    label: "Enforce Multi-Factor Authentication",
    description: "Require WebAuthn or TOTP verification for all workspace team members.",
    type: "boolean",
    default: true,
    allowedScopes: ["workspace"],
    sensitivity: "sensitive",
    schemaVersion: 1
  },
  {
    id: "security.session_timeout_mins",
    section: "security",
    label: "Session Idle Expiration",
    description: "Minutes of inactivity before a session requires re-authentication.",
    type: "number",
    default: 60,
    allowedScopes: ["workspace"],
    sensitivity: "sensitive",
    schemaVersion: 1
  },

  // ── 13. Workspace & Members ──
  {
    id: "workspace.org_name",
    section: "workspace",
    label: "Organization / Team Entity",
    description: "Corporate workspace name associated with billing and audit trails.",
    type: "string",
    default: "Synase Engineering Org",
    allowedScopes: ["workspace"],
    sensitivity: "public",
    schemaVersion: 1
  },
  {
    id: "workspace.allow_guest_invites",
    section: "workspace",
    label: "Permit External Reviewers",
    description: "Allow inviting third-party auditors and clients to inspect reports.",
    type: "boolean",
    default: false,
    allowedScopes: ["workspace"],
    sensitivity: "internal",
    schemaVersion: 1
  },

  // ── 14. Appearance & Accessibility ──
  {
    id: "appearance.theme",
    section: "appearance",
    label: "Color Theme",
    description: "Console color palette mode with Antigravity tokens.",
    type: "enum",
    default: "dark",
    options: [
      { label: "Antigravity Dark (Deep Obsidian)", value: "dark" },
      { label: "Antigravity Light (Clean High-Contrast)", value: "light" },
      { label: "System Sync", value: "system" }
    ],
    allowedScopes: ["user"],
    sensitivity: "public",
    schemaVersion: 1
  },
  {
    id: "appearance.density",
    section: "appearance",
    label: "Interface Spacing Density",
    description: "Adjust spatial padding for compact laptop viewports vs. wide monitors.",
    type: "enum",
    default: "comfortable",
    options: [
      { label: "Comfortable (Standard)", value: "comfortable" },
      { label: "Compact (High-Density)", value: "compact" }
    ],
    allowedScopes: ["user"],
    sensitivity: "public",
    schemaVersion: 1
  },
  {
    id: "appearance.reduced_motion",
    section: "appearance",
    label: "Reduced Motion",
    description: "Disable micro-animations and transition effects for accessibility.",
    type: "boolean",
    default: false,
    allowedScopes: ["user"],
    sensitivity: "public",
    schemaVersion: 1
  },

  // ── 15. Data & Import/Export ──
  {
    id: "data.auto_backup_weekly",
    section: "data",
    label: "Automated Snapshot Archive",
    description: "Weekly automated backup of project decisions, knowledge graphs, and audit trails.",
    type: "boolean",
    default: true,
    allowedScopes: ["workspace"],
    sensitivity: "internal",
    schemaVersion: 1
  },
  {
    id: "data.anonymize_exports",
    section: "data",
    label: "Anonymize PII in JSON Exports",
    description: "Strip author email addresses and internal hostnames from downloaded backups.",
    type: "boolean",
    default: true,
    allowedScopes: ["workspace"],
    sensitivity: "internal",
    schemaVersion: 1
  },

  // ── 16. Advanced ──
  {
    id: "advanced.experimental_features",
    section: "advanced",
    label: "Preview Experimental Capabilities",
    description: "Opt-in to cutting-edge reasoning strategies and prototype MCP tools.",
    type: "boolean",
    default: false,
    allowedScopes: ["workspace", "user"],
    sensitivity: "internal",
    schemaVersion: 1
  },
  {
    id: "advanced.telemetry_opt_in",
    section: "advanced",
    label: "Diagnostic Telemetry",
    description: "Share anonymous crash reports and pipeline timing to improve platform stability.",
    type: "boolean",
    default: false,
    allowedScopes: ["workspace", "user"],
    sensitivity: "internal",
    schemaVersion: 1
  }
];

export function getDefinitionsForSection(section) {
  return settingsRegistry.filter((item) => item.section === section);
}

export function getDefinitionById(id) {
  return settingsRegistry.find((item) => item.id === id);
}

/**
 * Resolves the effective setting value given a definition and an array of scoped values.
 * @param {import("../types/types.d.ts").SettingDefinition} definition
 * @param {Array<import("../types/types.d.ts").SettingValue>} existingValues
 * @param {{ workspaceId?: string; projectId?: string; agentId?: string; userId?: string }} [context]
 * @returns {import("../types/types.d.ts").EffectiveSetting}
 */
export function resolveEffectiveSetting(definition, existingValues = [], context = {}) {
  if (!existingValues || existingValues.length === 0) {
    return {
      id: definition.id,
      definition,
      value: structuredClone(definition.default),
      sourceScope: 'system',
      sourceId: 'system_default',
      isOverridden: false,
      constrainedByPolicy: false
    };
  }

  const systemVal = existingValues.find((v) => v.definitionId === definition.id && v.scope === 'system');
  const workspaceVal = existingValues.find(
    (v) => v.definitionId === definition.id && v.scope === 'workspace' && (!context.workspaceId || v.scopeId === context.workspaceId)
  );
  const projectVal = existingValues.find(
    (v) => v.definitionId === definition.id && v.scope === 'project' && (!context.projectId || v.scopeId === context.projectId)
  );
  const userVal = existingValues.find(
    (v) => v.definitionId === definition.id && v.scope === 'user' && (!context.userId || v.scopeId === context.userId)
  );

  if (systemVal && definition.allowedScopes.length === 1 && definition.allowedScopes[0] === 'system') {
    return {
      id: definition.id,
      definition,
      value: structuredClone(systemVal.value),
      sourceScope: 'system',
      sourceId: systemVal.scopeId,
      isOverridden: false,
      constrainedByPolicy: true
    };
  }

  if (projectVal && definition.allowedScopes.includes('project')) {
    return {
      id: definition.id,
      definition,
      value: structuredClone(projectVal.value),
      sourceScope: 'project',
      sourceId: projectVal.scopeId,
      isOverridden: true,
      constrainedByPolicy: false
    };
  }

  if (workspaceVal && definition.allowedScopes.includes('workspace')) {
    return {
      id: definition.id,
      definition,
      value: structuredClone(workspaceVal.value),
      sourceScope: 'workspace',
      sourceId: workspaceVal.scopeId,
      isOverridden: true,
      constrainedByPolicy: false
    };
  }

  if (userVal && definition.allowedScopes.includes('user')) {
    return {
      id: definition.id,
      definition,
      value: structuredClone(userVal.value),
      sourceScope: 'user',
      sourceId: userVal.scopeId,
      isOverridden: true,
      constrainedByPolicy: false
    };
  }

  return {
    id: definition.id,
    definition,
    value: structuredClone(definition.default),
    sourceScope: 'system',
    sourceId: 'system_default',
    isOverridden: false,
    constrainedByPolicy: false
  };
}
