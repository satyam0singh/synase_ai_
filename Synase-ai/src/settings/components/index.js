// @ts-check
/**
 * SYNASE AI — Settings Component Library
 * Composite views for the 16 canonical settings control plane domains.
 */

import { escapeHtml } from "../../shared/components/ui.js";
import { state } from "../../shared/state/store.js";
import { lucideIcon } from "../../shared/components/icons.js";
import { settingsSidebar, getSectionMeta, SETTINGS_CATEGORIES } from "./settingsSidebar.js";
import { settingsHeader } from "./settingsHeader.js";
import { settingRow } from "./settingRow.js";
import { settingsModalContainer } from "./modals.js";
import { settingsInspectorRail } from "./settingsInspector.js";
import { getDefinitionsForSection } from "../engine/registry.js";

export { settingsSidebar, settingsHeader, settingRow, settingsModalContainer, settingsInspectorRail, getSectionMeta, SETTINGS_CATEGORIES };

/**
 * Renders the generic setting rows for a given section.
 * @param {string} sectionId
 * @returns {string}
 */
export function renderSettingRows(sectionId) {
  const definitions = getDefinitionsForSection(sectionId);
  const effectiveMap = state.effectiveSettings || {};

  const query = (state.settingsSearchQuery || "").toLowerCase().trim();
  const filtered = definitions.filter((def) => {
    if (!query) return true;
    return (
      def.label.toLowerCase().includes(query) ||
      def.description.toLowerCase().includes(query) ||
      def.id.toLowerCase().includes(query)
    );
  });

  if (filtered.length === 0) {
    return `<div class="settings-empty-state">
      <p>No configuration properties found matching "${escapeHtml(query)}".</p>
    </div>`;
  }

  return filtered
    .map((def) => {
      const effective = effectiveMap[def.id] || {
        id: def.id,
        value: def.default,
        sourceScope: "system",
        isOverridden: false,
        isLocked: false,
        schemaVersion: def.schemaVersion || 1
      };
      return settingRow(effective, def);
    })
    .join("");
}

/**
 * 1. General Section View
 */
export function generalSectionView() {
  const user = state.user || { displayName: "Alex Turner", email: "alex.turner@synase.internal", role: "admin" };
  const isAuthenticated = Boolean(state.user && state.user.email);
  const curSurface = state.defaultLandingSurface || "/app/chat";
  const curTimeout = String(state.sessionTimeoutMinutes || 30);
  const cmdEnabled = state.commandPaletteEnabled !== false;
  const query = (state.settingsSearchQuery || "").toLowerCase().trim();

  const signedInMatches = !query || "signed-in account authenticated alex turner role admin active session".includes(query) || Boolean(user.email && user.email.toLowerCase().includes(query));
  const generalSettingRowsHtml = renderSettingRows("general");
  const hasGeneralRows = !generalSettingRowsHtml.includes("settings-empty-state");
  const showCard1 = signedInMatches || hasGeneralRows;

  const landingMatches = !query || "default landing surface workspace initial destination autonomous chat decision dashboard product intelligence devops reports".includes(query);
  const lockMatches = !query || "session inactivity lock workspace automatically lock browser credentials timeout minutes".includes(query);
  const cmdMatches = !query || "global command palette system cmd k ctrl k switcher enable".includes(query);
  const showCard2 = landingMatches || lockMatches || cmdMatches;

  const statMatches = !query || "system runtime posture integrity safety invariants architecture layers execution mode mock in-memory".includes(query);
  const showCard3 = statMatches;

  if (query && !showCard1 && !showCard2 && !showCard3) {
    return `<div class="settings-empty-state">
      <p>No configuration properties found matching "${escapeHtml(query)}".</p>
    </div>`;
  }

  return `
    <div class="settings-cards-stack">
      ${showCard1 ? `
      <!-- Card 1: User Profile & Identity -->
      <div class="settings-card">
        <div class="settings-card-head">
          <div>
            <h2 class="settings-card-title">User Profile & Identity</h2>
            <p class="settings-card-desc">Personal attributes used on generated decision briefs and sign-offs</p>
          </div>
        </div>
        <div class="settings-card-body">
          ${signedInMatches ? `
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label-wrap">
                <span class="setting-label">Signed-in Account</span>
                <span class="scope-badge">${isAuthenticated ? "AUTHENTICATED" : "LOCAL DEMO SESSION"}</span>
              </div>
              <p class="setting-description">${escapeHtml(user.email || "demo@synase.internal")} · Role: <code>${escapeHtml(user.role || "Admin")}</code></p>
            </div>
            <div class="setting-control">
              <span class="settings-status-pill is-active">Active Session</span>
            </div>
          </div>` : ""}
          ${hasGeneralRows ? generalSettingRowsHtml : ""}
        </div>
      </div>` : ""}

      ${showCard2 ? `
      <!-- Card 2: Workspace Environment Defaults -->
      <div class="settings-card">
        <div class="settings-card-head">
          <div>
            <h2 class="settings-card-title">Workspace Environment Defaults</h2>
            <p class="settings-card-desc">Control session timeout, primary landing surface, and developer navigation</p>
          </div>
        </div>
        <div class="settings-card-body">
          ${landingMatches ? `
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label-wrap">
                <span class="setting-label">Default Landing Surface</span>
                <span class="scope-badge">WORKSPACE</span>
              </div>
              <p class="setting-description">Initial destination when opening or signing in to the platform.</p>
            </div>
            <div class="setting-control">
              ${(() => {
                const surfaceOptions = [
                  { value: "/app/chat", label: "Autonomous Chat Canvas (Default)" },
                  { value: "/app/dashboard", label: "Decision Dashboard (Console Chrome)" },
                  { value: "/app/intelligence/product", label: "Product Intelligence" },
                  { value: "/app/intelligence/devops", label: "DevOps Intelligence" },
                  { value: "/app/projects", label: "Projects Directory" },
                  { value: "/app/reports", label: "Executive Reports" }
                ];
                const activeSurface = surfaceOptions.find(o => o.value === curSurface) || surfaceOptions[0];
                const surfaceOptionsHtml = surfaceOptions.map(opt => {
                  const isSelected = opt.value === curSurface;
                  return `<button
                    type="button"
                    class="settings-custom-option ${isSelected ? "is-selected" : ""}"
                    data-action="settings-custom-surface-pick"
                    data-value="${escapeHtml(opt.value)}"
                    role="option"
                    aria-selected="${isSelected}"
                  >
                    <span class="settings-option-text">${escapeHtml(opt.label)}</span>
                    ${isSelected ? `<span class="settings-option-check" aria-hidden="true">${lucideIcon('check', { size: 14 })}</span>` : ""}
                  </button>`;
                }).join("");
                return `<div class="settings-custom-select" data-setting-id="workspace.default_surface">
                  <button
                    type="button"
                    class="settings-select-trigger"
                    data-action="settings-custom-select-toggle"
                    data-setting-id="workspace.default_surface"
                    aria-haspopup="listbox"
                    aria-expanded="false"
                  >
                    <span class="settings-select-label">${escapeHtml(activeSurface.label)}</span>
                    <span class="settings-select-icon" aria-hidden="true">${lucideIcon('chevron-down', { size: 14 })}</span>
                  </button>
                  <div class="settings-custom-menu" role="listbox" aria-label="Default Landing Surface">
                    ${surfaceOptionsHtml}
                  </div>
                </div>`;
              })()}
            </div>
          </div>` : ""}
          ${lockMatches ? `
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label-wrap">
                <span class="setting-label">Session Inactivity Lock</span>
                <span class="scope-badge">WORKSPACE</span>
              </div>
              <p class="setting-description">Automatically lock browser credentials and prompt re-auth after inactivity.</p>
            </div>
            <div class="setting-control">
              ${(() => {
                const timeoutOptions = [
                  { value: "15", label: "15 Minutes" },
                  { value: "30", label: "30 Minutes (Recommended)" },
                  { value: "60", label: "1 Hour" },
                  { value: "240", label: "4 Hours" }
                ];
                const activeTimeout = timeoutOptions.find(o => o.value === String(curTimeout)) || timeoutOptions[1];
                const timeoutOptionsHtml = timeoutOptions.map(opt => {
                  const isSelected = opt.value === String(curTimeout);
                  return `<button
                    type="button"
                    class="settings-custom-option ${isSelected ? "is-selected" : ""}"
                    data-action="settings-custom-timeout-pick"
                    data-value="${escapeHtml(opt.value)}"
                    role="option"
                    aria-selected="${isSelected}"
                  >
                    <span class="settings-option-text">${escapeHtml(opt.label)}</span>
                    ${isSelected ? `<span class="settings-option-check" aria-hidden="true">${lucideIcon('check', { size: 14 })}</span>` : ""}
                  </button>`;
                }).join("");
                return `<div class="settings-custom-select" data-setting-id="workspace.session_timeout">
                  <button
                    type="button"
                    class="settings-select-trigger"
                    data-action="settings-custom-select-toggle"
                    data-setting-id="workspace.session_timeout"
                    aria-haspopup="listbox"
                    aria-expanded="false"
                  >
                    <span class="settings-select-label">${escapeHtml(activeTimeout.label)}</span>
                    <span class="settings-select-icon" aria-hidden="true">${lucideIcon('chevron-down', { size: 14 })}</span>
                  </button>
                  <div class="settings-custom-menu" role="listbox" aria-label="Session Inactivity Lock">
                    ${timeoutOptionsHtml}
                  </div>
                </div>`;
              })()}
            </div>
          </div>` : ""}
          ${cmdMatches ? `
          <div class="setting-row">
            <div class="setting-info">
              <div class="setting-label-wrap">
                <span class="setting-label">Global Command Palette</span>
                <span class="scope-badge">SYSTEM</span>
              </div>
              <p class="setting-description">Enable <code>⌘ K</code> or <code>Ctrl K</code> modal switcher across all views.</p>
            </div>
            <div class="setting-control">
              <label class="toggle-switch" data-action="settings-cmd-palette-toggle" title="Toggle ⌘ K shortcut across application">
                <input type="checkbox" data-action="settings-cmd-palette-toggle" ${cmdEnabled ? "checked" : ""} />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>` : ""}
        </div>
      </div>` : ""}

      ${showCard3 ? `
      <!-- Card 3: System Runtime Posture & Integrity -->
      <div class="settings-card">
        <div class="settings-card-head">
          <div>
            <h2 class="settings-card-title">System Runtime Posture & Integrity</h2>
            <p class="settings-card-desc">Safety guarantees, architecture layers, and deterministic boundary verification</p>
          </div>
        </div>
        <div class="settings-card-body p-4">
          <div class="settings-stat-grid three-col">
            <div class="settings-stat-box">
              <span class="settings-stat-label">Architecture Layers</span>
              <span class="settings-stat-val">13 Layers</span>
              <span class="settings-stat-hint">Clean separation</span>
            </div>
            <div class="settings-stat-box">
              <span class="settings-stat-label">Safety Invariants</span>
              <span class="settings-stat-val">24 Active</span>
              <span class="settings-stat-hint">Asserted by suite</span>
            </div>
            <div class="settings-stat-box">
              <span class="settings-stat-label">Execution Mode</span>
              <span class="settings-stat-val">Mock In-Memory</span>
              <span class="settings-stat-hint">Zero external egress</span>
            </div>
          </div>
        </div>
      </div>` : ""}
    </div>
  `;
}

/**
 * 2. AI & Models Section View
 */
/**
 * 2. AI & Models Section View
 */
export function aiModelsSectionView() {
  const providers = [
    { name: "Google Gemini", status: "Active (Primary)", latency: "240ms", models: "Gemini 1.5 Pro, Flash" },
    { name: "Anthropic Claude", status: "Active (Fallback)", latency: "310ms", models: "Claude 3.5 Sonnet, Haiku" },
    { name: "OpenAI", status: "Available", latency: "290ms", models: "GPT-4o, GPT-4o-mini" },
    { name: "Ollama (Local Private)", status: "Connected", latency: "42ms", models: "Llama 3 8B, Mistral 7B" }
  ];

  const providersRows = providers
    .map(
      (p) => `<tr>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td><span class="settings-status-pill is-active">${escapeHtml(p.status)}</span></td>
        <td><code>${escapeHtml(p.latency)}</code></td>
        <td><span class="text-muted">${escapeHtml(p.models)}</span></td>
        <td>
          <button class="btn small secondary" type="button" data-action="settings-ping-provider" data-provider="${escapeHtml(p.name)}">
            Ping Gateway
          </button>
        </td>
      </tr>`
    )
    .join("");

  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Reasoning & Synthesis Models</h2>
          <p class="settings-card-desc">Configure LLM providers, temperature determinism, and fallback resilience</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("ai-models")}
      </div>
    </div>

    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Configured Model Providers</h2>
          <p class="settings-card-desc">Real-time gateway connectivity status and latency metrics</p>
        </div>
      </div>
      <div class="settings-card-body">
        <table class="settings-table">
          <thead>
            <tr>
              <th>Provider Gateway</th>
              <th>Status</th>
              <th>Median Latency</th>
              <th>Supported Endpoints</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${providersRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * 3. Agents & Autonomy Section View
 */
export function agentsSectionView() {
  const policy = state.agentPolicy || {
    autonomyLevel: "supervised",
    requireApprovalFor: ["file_write", "shell_exec", "deploy"],
    maxChainSteps: 25
  };

  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Autonomous Action Thresholds</h2>
          <p class="settings-card-desc">Control how agentic decision chains execute and when human approval is required</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("agents")}
      </div>
    </div>

    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Effective Autonomy Explanation</h2>
          <p class="settings-card-desc">Current operative policy rules applied across all tasks</p>
        </div>
      </div>
      <div class="settings-card-body p-4">
        <div class="settings-policy-callout">
          <p>Agents operate in <strong>${escapeHtml(String(policy.autonomyLevel || "supervised").toUpperCase())}</strong> mode. Analysis, search, and context assembly occur autonomously. Any mutating actions (including writing files, executing terminal commands, or deploying changes) will immediately pause the run and require an interactive cryptographic human approval.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * 4. Memory & Context Section View
 */
export function memorySectionView() {
  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Semantic Vector Memory</h2>
          <p class="settings-card-desc">ChromaDB semantic indexing, compaction policies, and retention limits</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("memory")}
      </div>
    </div>

    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Vector Memory Index Status</h2>
          <p class="settings-card-desc">Current index stats for workspace: <code>${escapeHtml(state.workspaceId || "ws_synase")}</code></p>
        </div>
      </div>
      <div class="settings-card-body p-4">
        <div class="settings-stat-grid three-col">
          <div class="settings-stat-box">
            <span class="settings-stat-label">Indexed Documents</span>
            <span class="settings-stat-val">1,248</span>
          </div>
          <div class="settings-stat-box">
            <span class="settings-stat-label">Vector Embeddings</span>
            <span class="settings-stat-val">18,490</span>
          </div>
          <div class="settings-stat-box">
            <span class="settings-stat-label">Index Storage</span>
            <span class="settings-stat-val">34.2 MB</span>
          </div>
        </div>
        <div class="settings-button-group mt-4">
          <button class="btn secondary small" data-action="settings-compact-memory" type="button">
            ${lucideIcon("database", { size: 14 })} Run ChromaDB Index Compaction
          </button>
          <button class="btn secondary small" data-action="settings-purge-memory" type="button">
            ${lucideIcon("trash-2", { size: 14 })} Prune Stale Embeddings (&lt; 0.6 Similarity)
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * 5. Tools & Permissions Section View
 */
export function toolsSectionView() {
  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Tool Execution Permissions</h2>
          <p class="settings-card-desc">Fine-grained RBAC controls governing shell, file modifications, and MCP tools</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("tools")}
      </div>
    </div>
  `;
}

/**
 * 6. Connectors Section View
 */
export function connectorsSectionView() {
  const connectors = state.settingsConnectors || [];

  const getConnectorIconSvg = (c) => {
    const prov = (c.provider || "").toLowerCase();
    if (prov.includes("github")) return lucideIcon("git-branch", { size: 18 });
    if (prov.includes("jira")) return lucideIcon("layers", { size: 18 });
    if (prov.includes("linear")) return lucideIcon("workflow", { size: 18 });
    if (prov.includes("slack")) return lucideIcon("message-square", { size: 18 });
    return lucideIcon("network", { size: 18 });
  };

  const cardsHtml = connectors
    .map(
      (c) => `
      <div class="settings-connector-card">
        <div class="settings-connector-card-head">
          <div class="settings-connector-info">
            <span class="settings-connector-logo">${getConnectorIconSvg(c)}</span>
            <div class="settings-connector-meta">
              <h3 class="settings-connector-name" title="${escapeHtml(c.name)}">${escapeHtml(c.name)}</h3>
              <p class="settings-connector-scopes" title="Scopes: ${escapeHtml(c.scopes.join(", "))}">Scopes: ${escapeHtml(c.scopes.join(", "))}</p>
            </div>
          </div>
          <span class="settings-status-pill ${c.status === "connected" ? "is-active" : ""}">${escapeHtml(c.status.toUpperCase())}</span>
        </div>
        <div class="settings-connector-card-foot">
          <span class="text-muted">Last synced: ${escapeHtml(c.lastSync || "Never")}</span>
          <div class="settings-connector-actions">
            ${
              c.status === "connected"
                ? `
                <button class="btn small secondary" data-action="settings-connector-sync" data-connector-id="${escapeHtml(c.id)}" type="button">Sync Now</button>
                <button class="btn small danger-text" data-action="settings-connector-toggle" data-connector-id="${escapeHtml(c.id)}" data-next-status="disconnected" type="button">Disconnect</button>
                `
                : `<button class="btn small primary" data-action="settings-open-connector-modal" data-connector-id="${escapeHtml(c.id)}" type="button">Connect</button>`
            }
          </div>
        </div>
      </div>
    `
    )
    .join("");

  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Telemetry & Source Connectors</h2>
          <p class="settings-card-desc">OAuth 2.0 integrations with source code repositories, issue trackers, and team channels</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("connectors")}
      </div>
    </div>

    <div class="settings-connectors-grid">
      ${cardsHtml}
    </div>
  `;
}

/**
 * 7. Messaging Section View
 */
export function messagingSectionView() {
  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Notification & Webhook Channels</h2>
          <p class="settings-card-desc">Broadcast completed decisions, pipeline failures, and approvals to external channels</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("messaging")}
      </div>
    </div>

    <!-- Interactive Webhook Test Card -->
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Webhook Endpoint Simulation & Testing</h2>
          <p class="settings-card-desc">Test delivery of structured JSON decision payloads to your webhook URL</p>
        </div>
      </div>
      <div class="settings-card-body p-4">
        <div class="settings-form-row">
          <div class="settings-form-group flex-1">
            <label class="settings-form-label" for="test-webhook-url">Endpoint URL</label>
            <input
              type="url"
              id="test-webhook-url"
              class="settings-input full-width"
              placeholder="https://api.yourcompany.com/webhooks/synase"
              value="https://hooks.slack.com/services/mock/T00/B00/X00"
            />
          </div>
          <div class="settings-form-group">
            <label class="settings-form-label" for="test-webhook-event">Event Payload</label>
            <select id="test-webhook-event" class="settings-select">
              <option value="decision.approved">decision.approved</option>
              <option value="pipeline.failure">pipeline.failure</option>
              <option value="security.gate_tripped">security.gate_tripped</option>
            </select>
          </div>
          <div class="settings-form-group align-end">
            <button class="btn primary" type="button" data-action="settings-test-webhook">
              Send Test Dispatch
            </button>
          </div>
        </div>
        <div id="test-webhook-feedback"></div>
      </div>
    </div>
  `;
}

/**
 * 8. Vault & Knowledge Section View
 */
export function vaultSectionView() {
  const stagedDocs = state.vaultStagedDocuments || [];
  const selected = state.vaultSelectedFile;

  const stagedRows = stagedDocs
    .map(
      (d) => `<tr>
        <td><strong>${escapeHtml(d.name)}</strong></td>
        <td><code>${escapeHtml(d.size)}</code></td>
        <td><span class="settings-scope-pill">${escapeHtml(d.type)}</span></td>
        <td>${escapeHtml(d.stagedAt)}</td>
        <td><span class="settings-status-pill is-active">Staged</span></td>
        <td>
          <button class="btn small danger-text" data-action="settings-vault-remove-doc" data-doc-id="${escapeHtml(d.id)}">Remove</button>
        </td>
      </tr>`
    )
    .join("");

  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Knowledge Vault Ingestion</h2>
          <p class="settings-card-desc">Chunking windows, graph extraction parameters, and auto-indexing policies</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("vault")}
      </div>
    </div>

    <!-- Interactive Vault Upload & Staging Card -->
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Document Ingestion & File Staging</h2>
          <p class="settings-card-desc">Stage reference documents, architecture briefs, or schemas into local session memory</p>
        </div>
      </div>
      <div class="settings-card-body p-4">
        <div class="settings-dropzone" id="vault-dropzone">
          <div class="dropzone-content">
            <span class="dropzone-icon" aria-hidden="true">▥</span>
            <p class="dropzone-title">Drag & drop knowledge files here, or <label class="file-browse-label" for="vault-file-input">browse</label></p>
            <p class="dropzone-subtitle">Supported: Markdown (.md), Text (.txt), PDF, JSON, CSV (Max 25 MB)</p>
          </div>
          <input type="file" id="vault-file-input" class="hidden-file-input" accept=".md,.txt,.pdf,.json,.csv" />
        </div>

        ${
          selected
            ? `
          <div class="settings-file-preview-card mt-3">
            <div class="file-preview-info">
              <span class="file-preview-icon">📄</span>
              <div>
                <strong>${escapeHtml(selected.name)}</strong>
                <p class="text-muted small">${escapeHtml(selected.formattedSize)} · ${escapeHtml(selected.type || "Document")}</p>
                ${selected.error ? `<p class="text-danger small">${escapeHtml(selected.error)}</p>` : ""}
              </div>
            </div>
            <div class="file-preview-actions">
              <button class="btn small secondary" type="button" data-action="remove-vault-file">Remove</button>
              <button class="btn small primary" type="button" data-action="stage-vault-document" ${selected.error ? "disabled" : ""}>Stage into Vault</button>
            </div>
          </div>
        `
            : ""
        }

        <div class="settings-table-wrap mt-4">
          <table class="settings-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Size</th>
                <th>Format</th>
                <th>Staged At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${stagedRows || '<tr><td colspan="6" class="text-center p-4 text-muted">No documents staged in current session. Drop or select a file above.</td></tr>'}
            </tbody>
          </table>
        </div>
        <p class="settings-card-desc mt-3">
          <strong>Note on remote indexing:</strong> Staged files are parsed and held in client-side session memory. Permanent vector embedding and remote knowledge graph indexing require backend inference integration.
        </p>
      </div>
    </div>
  `;
}

/**
 * 9. API & Developer Section View (Invariant 19 Key Table)
 */
export function developerSectionView() {
  const apiKeys = state.apiKeys || [];

  const keysRows = apiKeys
    .map(
      (k) => `<tr>
        <td><strong>${escapeHtml(k.name)}</strong></td>
        <td><code>${escapeHtml(k.maskedPrefix)}</code></td>
        <td>${k.scopes.map((s) => `<span class="settings-scope-pill">${escapeHtml(s)}</span>`).join(" ")}</td>
        <td>${escapeHtml(k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "Active")}</td>
        <td>
          <button class="btn small danger-text" data-action="settings-revoke-key" data-key-id="${escapeHtml(k.id)}">
            Revoke
          </button>
        </td>
      </tr>`
    )
    .join("");

  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">API Keys (Invariant 19 Compliant)</h2>
          <p class="settings-card-desc">Programmatic access credentials. Raw secrets are shown only once at creation time.</p>
        </div>
        <button class="btn primary" data-action="settings-open-create-key-modal" type="button">
          ${lucideIcon('plus', { size: 14 })} Generate New API Key
        </button>
      </div>
      <div class="settings-card-body">
        <table class="settings-table">
          <thead>
            <tr>
              <th>Key Identifier</th>
              <th>Secret Prefix</th>
              <th>Permissions</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${keysRows || '<tr><td colspan="5" class="text-center p-4">No active API keys found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Developer Environment & Tracing</h2>
          <p class="settings-card-desc">Configure client-side telemetry debugging and mock API simulation latency</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("developer")}
      </div>
    </div>
  `;
}

/**
 * 10. Automations Section View
 */
export function automationsSectionView() {
  const automations = state.settingsAutomations || [];

  const autoRows = automations
    .map(
      (a) => `<tr>
        <td><strong>${escapeHtml(a.name)}</strong></td>
        <td><code>${escapeHtml(a.schedule)}</code></td>
        <td><span class="settings-status-pill ${a.status === "active" ? "is-active" : ""}">${escapeHtml(a.status.toUpperCase())}</span></td>
        <td>${escapeHtml(a.lastRun || "Never")}</td>
        <td>
          <div class="settings-button-group">
            <button class="btn small secondary" data-action="settings-run-automation" data-auto-id="${escapeHtml(a.id)}" type="button">
              ▶ Run Now
            </button>
            <button class="btn small secondary" data-action="settings-automation-toggle" data-auto-id="${escapeHtml(a.id)}" data-next-status="${a.status === "active" ? "paused" : "active"}" type="button">
              ${a.status === "active" ? "Pause" : "Resume"}
            </button>
          </div>
        </td>
      </tr>`
    )
    .join("");

  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Background Automation Policies</h2>
          <p class="settings-card-desc">Concurrency limits, scheduled tasks, and error handling rules</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("automations")}
      </div>
    </div>

    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Scheduled Autonomous Jobs</h2>
          <p class="settings-card-desc">Periodic analysis and telemetry rollup triggers</p>
        </div>
      </div>
      <div class="settings-card-body">
        <table class="settings-table">
          <thead>
            <tr>
              <th>Job Name</th>
              <th>Cron Schedule</th>
              <th>Status</th>
              <th>Last Executed</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${autoRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * 11. Usage & Limits Section View
 */
export function usageSectionView() {
  const usage = {
    consumedTokens: 14.8,
    capTokens: 50,
    apiCalls: 48920,
    estimatedCost: "$44.40"
  };
  const percent = Math.round((usage.consumedTokens / usage.capTokens) * 100);

  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Monthly Quota Consumption</h2>
          <p class="settings-card-desc">Current billing cycle token usage across foundation models</p>
        </div>
      </div>
      <div class="settings-card-body p-4">
        <div class="settings-usage-panel">
          <div class="settings-usage-header">
            <span class="settings-usage-label">Token Consumption</span>
            <span class="settings-usage-stat"><strong>${usage.consumedTokens}M</strong> of ${usage.capTokens}M tokens consumed (<strong>${percent}%</strong>)</span>
          </div>
          <div class="settings-progress-bar">
            <div class="settings-progress-fill" style="width: ${percent}%;"></div>
          </div>
        </div>
        <div class="settings-stat-grid two-col mt-4">
          <div class="settings-stat-box">
            <span class="settings-stat-label">Inference Calls</span>
            <span class="settings-stat-val">${usage.apiCalls.toLocaleString()}</span>
          </div>
          <div class="settings-stat-box">
            <span class="settings-stat-label">Projected Monthly Spend</span>
            <span class="settings-stat-val">${usage.estimatedCost}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Usage & Budget Ceiling Settings</h2>
          <p class="settings-card-desc">Configurable quota limits and automated warning thresholds</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("usage")}
      </div>
    </div>
  `;
}

/**
 * 12. Security & Privacy Section View
 */
export function securitySectionView() {
  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Workspace Security & Authentication</h2>
          <p class="settings-card-desc">Session timeouts, MFA enforcement, and access governance</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("security")}
      </div>
    </div>
  `;
}

/**
 * 13. Workspace & Members Section View
 */
export function workspaceSectionView() {
  const members = (state.members && state.members.length > 0)
    ? state.members
    : [
        { name: "Alex Turner", email: "alex.turner@synase.internal", role: "Owner", mfa: "Enforced" },
        { name: "Dev Lead (Maya)", email: "maya@synase.internal", role: "Admin", mfa: "Enforced" },
        { name: "Product Analyst (Jordan)", email: "jordan@synase.internal", role: "Analyst", mfa: "Enforced" }
      ];

  const memberRows = members
    .map(
      (m) => `<tr>
        <td><strong>${escapeHtml(m.name)}</strong></td>
        <td><code>${escapeHtml(m.email)}</code></td>
        <td><span class="settings-scope-pill">${escapeHtml(m.role || "Member")}</span></td>
        <td><span class="settings-status-pill is-active">${escapeHtml(m.mfa || "Enforced")}</span></td>
      </tr>`
    )
    .join("");

  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Organization Identity</h2>
          <p class="settings-card-desc">Primary workspace identity and guest reviewer policies</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("workspace")}
      </div>
    </div>

    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Workspace Members</h2>
          <p class="settings-card-desc">Active operators with access to workspace models and projects</p>
        </div>
        <button class="btn primary small" data-action="invite" type="button">
          ${lucideIcon('plus', { size: 14 })} Invite Member
        </button>
      </div>
      <div class="settings-card-body">
        <table class="settings-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email</th>
              <th>Assigned Role</th>
              <th>MFA Status</th>
            </tr>
          </thead>
          <tbody>
            ${memberRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * 14. Appearance & Accessibility Section View
 */
export function appearanceSectionView() {
  const curTheme = typeof document !== "undefined" ? (document.documentElement.getAttribute("data-theme") || "dark") : "dark";
  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Antigravity Design & Display</h2>
          <p class="settings-card-desc">Dark Obsidian palette, sharp square geometry, and motion preferences</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("appearance")}
      </div>
    </div>

    <!-- Quick Theme Preset Switcher Card -->
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Theme Preset Mode</h2>
          <p class="settings-card-desc">Instantly toggle active console color scheme</p>
        </div>
      </div>
      <div class="settings-card-body p-4">
        <div class="settings-theme-switcher-grid">
          <button
            class="theme-preset-card ${curTheme === "dark" ? "is-selected" : ""}"
            data-action="settings-set-theme"
            data-theme="dark"
            type="button"
          >
            <span class="theme-preset-badge">DEEP OBSIDIAN</span>
            <strong>Antigravity Dark</strong>
            <p class="small text-muted">Focused dark charcoal background for low-light environments.</p>
          </button>
          <button
            class="theme-preset-card ${curTheme === "light" ? "is-selected" : ""}"
            data-action="settings-set-theme"
            data-theme="light"
            type="button"
          >
            <span class="theme-preset-badge">HIGH CONTRAST</span>
            <strong>Antigravity Light</strong>
            <p class="small text-muted">Clean paper white background with crisp typography.</p>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * 15. Data & Import/Export Section View
 */
export function dataSectionView() {
  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Automated Backup & Privacy Policies</h2>
          <p class="settings-card-desc">Scheduled snapshots and PII redaction rules</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("data")}
      </div>
    </div>

    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Workspace Data Portability</h2>
          <p class="settings-card-desc">Export or import complete decision intelligence and configuration bundles</p>
        </div>
      </div>
      <div class="settings-card-body p-4">
        <div class="settings-button-group">
          <button class="btn primary" data-action="settings-open-export-modal" type="button">
            ⤓ Export Workspace State (JSON)
          </button>
          <button class="btn secondary" data-action="settings-open-import-modal" type="button">
            ⤒ Validate & Import State
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * 16. Advanced Section View
 */
export function advancedSectionView() {
  return `
    <div class="settings-card">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Experimental Capabilities & Diagnostics</h2>
          <p class="settings-card-desc">Opt-in previews and platform diagnostics</p>
        </div>
      </div>
      <div class="settings-card-body">
        ${renderSettingRows("advanced")}
      </div>
    </div>

    <div class="settings-card danger-zone">
      <div class="settings-card-head">
        <div>
          <h2 class="settings-card-title">Danger Zone: Factory Reset</h2>
          <p class="settings-card-desc">Erase all workspace overrides and restore system defaults across all 16 domains</p>
        </div>
      </div>
      <div class="settings-card-body p-4">
        <button class="btn danger" data-action="settings-open-reset-modal" type="button">
          Reset All Settings to System Defaults
        </button>
      </div>
    </div>
  `;
}

/**
 * Main dispatcher for rendering a section by ID.
 * @param {string} sectionId
 * @returns {string}
 */
export function renderSectionContent(sectionId) {
  switch (sectionId) {
    case "general":
      return generalSectionView();
    case "ai-models":
      return aiModelsSectionView();
    case "agents":
      return agentsSectionView();
    case "memory":
      return memorySectionView();
    case "tools":
      return toolsSectionView();
    case "connectors":
      return connectorsSectionView();
    case "messaging":
      return messagingSectionView();
    case "vault":
      return vaultSectionView();
    case "developer":
      return developerSectionView();
    case "automations":
      return automationsSectionView();
    case "usage":
      return usageSectionView();
    case "security":
      return securitySectionView();
    case "workspace":
      return workspaceSectionView();
    case "appearance":
      return appearanceSectionView();
    case "data":
      return dataSectionView();
    case "advanced":
      return advancedSectionView();
    default:
      return `
        <div class="settings-card">
          <div class="settings-card-head">
            <div>
              <h2 class="settings-card-title">${escapeHtml(getSectionMeta(sectionId).label)}</h2>
              <p class="settings-card-desc">${escapeHtml(getSectionMeta(sectionId).desc)}</p>
            </div>
          </div>
          <div class="settings-card-body">
            ${renderSettingRows(sectionId)}
          </div>
        </div>
      `;
  }
}
