// @ts-check
/**
 * SYNASE AI — Settings Modal Components
 * Provides modals for API Key creation/reveal (Invariant 19), Connectors, Export/Import, and Danger resets.
 */

import { escapeHtml } from "../../shared/components/ui.js";
import { state } from "../../shared/state/store.js";
import { lucideIcon } from "../../shared/components/icons.js";

/**
 * Renders the active modal dialog if one is open.
 * @returns {string}
 */
export function settingsModalContainer() {
  const modal = state.settingsActiveModal;
  if (!modal) return "";

  let title = "";
  let bodyHtml = "";
  let footerHtml = "";

  if (modal.type === "create-api-key") {
    title = "Generate New API Key";
    bodyHtml = `
      <form id="settings-create-key-form">
        <div class="settings-form-group">
          <label class="settings-form-label" for="new-key-name">Key Name / Description</label>
          <input
            type="text"
            id="new-key-name"
            class="settings-input full-width"
            placeholder="e.g. CI/CD Pipeline Agent, GitHub Action"
            value="Production Agent Key"
            required
          />
        </div>
        <div class="settings-form-group">
          <label class="settings-form-label">Granted Permissions (Scopes)</label>
          <div class="settings-checkbox-grid">
            <label class="settings-checkbox-item">
              <input type="checkbox" name="scope" value="read" checked />
              <span><code>read</code> — Read reports & graph context</span>
            </label>
            <label class="settings-checkbox-item">
              <input type="checkbox" name="scope" value="write" checked />
              <span><code>write</code> — Create analysis & proposals</span>
            </label>
            <label class="settings-checkbox-item">
              <input type="checkbox" name="scope" value="execute" checked />
              <span><code>execute</code> — Trigger agent runs & tools</span>
            </label>
            <label class="settings-checkbox-item">
              <input type="checkbox" name="scope" value="admin" />
              <span><code>admin</code> — Modify workspace policies</span>
            </label>
          </div>
        </div>
        <div class="settings-form-group">
          <label class="settings-form-label" for="new-key-expiry">Expiration</label>
          <select id="new-key-expiry" class="settings-select full-width">
            <option value="30">30 Days</option>
            <option value="90" selected>90 Days (Recommended)</option>
            <option value="365">1 Year</option>
            <option value="0">Never Expires</option>
          </select>
        </div>
      </form>
    `;
    footerHtml = `
      <button class="btn secondary" data-action="settings-modal-close" type="button">Cancel</button>
      <button class="btn primary" data-action="settings-create-key-submit" type="button">Generate Key</button>
    `;
  } else if (modal.type === "api-key-revealed") {
    title = "API Key Generated Successfully";
    const secret = modal.data?.oneTimeSecret || "syn_live_demo_secret_token";
    bodyHtml = `
      <div class="settings-alert-warning">
        <span class="settings-alert-icon">⚠️</span>
        <div>
          <strong>Invariant 19 Security Enforcement:</strong>
          <p>This secret key will <strong>never</strong> be displayed again. Copy it now and store it in an environment secret manager.</p>
        </div>
      </div>
      <div class="settings-secret-box">
        <code id="settings-secret-value">${escapeHtml(secret)}</code>
        <button class="btn small primary" data-action="settings-copy-secret" data-secret="${escapeHtml(secret)}" type="button">
          Copy
        </button>
      </div>
      <div class="settings-key-meta-list">
        <div><strong>Prefix Identifier:</strong> <code>${escapeHtml(secret.slice(0, 16))}...</code></div>
        <div><strong>Key Name:</strong> ${escapeHtml(modal.data?.name || "API Key")}</div>
      </div>
    `;
    footerHtml = `
      <button class="btn primary" data-action="settings-modal-close" type="button">I Have Stored the Key</button>
    `;
  } else if (modal.type === "connect-connector") {
    const connector = modal.data || {};
    title = `Authorize Connector: ${connector.name || "Provider"}`;
    bodyHtml = `
      <div class="settings-connector-auth-box">
        <div class="settings-connector-auth-head">
          <span class="settings-connector-glyph">${escapeHtml(connector.icon || "⊞")}</span>
          <div>
            <h4>${escapeHtml(connector.name || "Integration")}</h4>
            <p>OAuth 2.0 Authorization Grant</p>
          </div>
        </div>
        <p class="settings-connector-info">
          SYNASE AI will request read and telemetry permissions to inspect issues, pull requests, and commit metadata.
        </p>
        <div class="settings-scope-list">
          <div class="settings-scope-pill">repo:read</div>
          <div class="settings-scope-pill">issues:read</div>
          <div class="settings-scope-pill">pull_requests:read</div>
          <div class="settings-scope-pill">telemetry:sync</div>
        </div>
      </div>
    `;
    footerHtml = `
      <button class="btn secondary" data-action="settings-modal-close" type="button">Cancel</button>
      <button class="btn primary" data-action="settings-connector-confirm-connect" data-connector-id="${escapeHtml(connector.id)}" type="button">Authorize & Connect</button>
    `;
  } else if (modal.type === "export-data") {
    title = "Export Workspace State Archive";
    bodyHtml = `
      <p>Generate a cryptographically validated JSON bundle containing all workspace decision trees, knowledge graph nodes, and audit logs.</p>
      <div class="settings-form-group">
        <label class="settings-checkbox-item">
          <input type="checkbox" id="export-anonymize" checked />
          <span>Anonymize author emails and internal hostnames (GDPR/SOC2)</span>
        </label>
      </div>
      <div class="settings-form-group">
        <label class="settings-checkbox-item">
          <input type="checkbox" id="export-include-audit" checked />
          <span>Include full immutable audit trail</span>
        </label>
      </div>
    `;
    footerHtml = `
      <button class="btn secondary" data-action="settings-modal-close" type="button">Cancel</button>
      <button class="btn primary" data-action="settings-export-confirm" type="button">Download JSON Export</button>
    `;
  } else if (modal.type === "inspect-scope") {
    const scopeData = modal.data || {};
    const scopeName = scopeData.scope || "user";
    const rank = scopeData.rank || 1;
    const ctx = scopeData.context || "Local Session";
    title = `Hierarchy Resolver: ${scopeName.toUpperCase()} Scope (Rank ${rank} of 7)`;

    const scopeRules = {
      user: {
        precedence: "Highest precedence override (Rank 1). Directly binds to the authenticated operator.",
        mutability: "Editable by the current user. Overrides workspace and system defaults.",
        properties: ["general.profile_name", "general.email_notifications", "appearance.theme", "appearance.density", "appearance.reduced_motion"]
      },
      session: {
        precedence: "Interactive session override (Rank 2). Ephemeral to the active browser tab.",
        mutability: "Transient in memory. Discarded on session termination.",
        properties: ["Session inactivity lock", "Active command filter", "Staged document inventory"]
      },
      task: {
        precedence: "Task-level override (Rank 3). Applied to a specific reasoning run or agent delegation.",
        mutability: "Managed by autonomous orchestration chains.",
        properties: ["Chain max steps", "Reasoning effort allocation", "Tool confirmation flags"]
      },
      agent: {
        precedence: "Agent persona override (Rank 4). Governs specific sub-agent policies and permissions.",
        mutability: "Configurable via Agent Policy API.",
        properties: ["agents.autonomy_level", "agents.confirmation_policy", "agents.max_chain_steps"]
      },
      project: {
        precedence: "Project-level override (Rank 5). Scoped to the currently selected project workspace.",
        mutability: "Editable by Project Admins and Workspace Owners.",
        properties: ["ai.default_model", "ai.temperature", "tools.allow_terminal_exec", "vault.chunk_size"]
      },
      workspace: {
        precedence: "Workspace-level override (Rank 6). Applies across all projects in the organization.",
        mutability: "Editable by Workspace Admins. Sets default operational baseline.",
        properties: ["workspace.name", "ai.fallback_provider", "connectors.*", "security.mfa_enforced"]
      },
      system: {
        precedence: "System schema baseline (Rank 7). Base default values defined in registry schema.",
        mutability: "Immutable system constants. Cannot be modified directly.",
        properties: ["All 40+ canonical configuration schema definitions"]
      }
    }[scopeName] || {
      precedence: "Evaluation flows top-to-bottom according to strict hierarchical precedence.",
      mutability: "Scoped policy enforcement.",
      properties: []
    };

    bodyHtml = `
      <div class="settings-scope-modal-content">
        <div class="settings-scope-modal-header">
          <div class="scope-badge large ${rank === 1 ? "is-overridden" : ""}">RANK ${rank} · ${escapeHtml(scopeName.toUpperCase())}</div>
          <span class="text-muted">Target Context: <strong>${escapeHtml(ctx)}</strong></span>
        </div>
        <div class="settings-policy-callout mt-3">
          <strong>Precedence Rule:</strong>
          <p>${escapeHtml(scopeRules.precedence)}</p>
        </div>
        <div class="settings-policy-callout mt-2">
          <strong>Governance & Mutability:</strong>
          <p>${escapeHtml(scopeRules.mutability)}</p>
        </div>
        <div class="mt-3">
          <strong>Governed Configuration Properties:</strong>
          <ul class="settings-scope-prop-list mt-1">
            ${scopeRules.properties.map((p) => `<li><code>${escapeHtml(p)}</code></li>`).join("")}
          </ul>
        </div>
        <div class="settings-alert-info mt-3">
          <span class="settings-alert-icon">ℹ️</span>
          <div>
            <strong>Deterministic Resolution Invariant 24:</strong>
            <p>Evaluation flows strictly top-to-bottom. A value defined at a higher scope overrides all lower scopes without mutating lower scope records.</p>
          </div>
        </div>
      </div>
    `;
    footerHtml = `
      <button class="btn primary" data-action="settings-modal-close" type="button">Understood</button>
    `;
  } else if (modal.type === "confirm-reset-section") {
    const secId = modal.data?.sectionId || "general";
    title = `Reset "${secId.toUpperCase()}" Defaults`;
    bodyHtml = `
      <div class="settings-alert-warning">
        <span class="settings-alert-icon">⚠️</span>
        <div>
          <strong>Reset Section Configuration</strong>
          <p>This will restore system default values for all properties in the <strong>${escapeHtml(secId)}</strong> section. Custom overrides at project and workspace scope will be cleared.</p>
        </div>
      </div>
      <p>Are you sure you want to proceed with resetting this section?</p>
    `;
    footerHtml = `
      <button class="btn secondary" data-action="settings-modal-close" type="button">Cancel</button>
      <button class="btn danger" data-action="settings-reset-section-confirm" data-section-id="${escapeHtml(secId)}" type="button">Reset Section</button>
    `;
  } else if (modal.type === "import-data") {
    title = "Import Configuration & Workspace State";
    bodyHtml = `
      <p>Upload a previously exported SYNASE AI JSON snapshot to restore or synchronize settings.</p>
      <div class="settings-form-group">
        <label class="settings-form-label" for="import-json-file">Upload JSON File</label>
        <input type="file" id="import-json-file" class="settings-input full-width" accept=".json,application/json" data-action="settings-import-file-picked" />
      </div>
      <div class="settings-form-group">
        <label class="settings-form-label" for="import-json-payload">Or Paste JSON Snapshot Data</label>
        <textarea id="import-json-payload" class="settings-textarea" rows="6" placeholder='{"version": 1, "workspaceId": "ws_synase", "effectiveSettings": {...}}'></textarea>
      </div>
      <div id="import-validation-result"></div>
    `;
    footerHtml = `
      <button class="btn secondary" data-action="settings-modal-close" type="button">Cancel</button>
      <button class="btn primary" data-action="settings-import-validate" type="button">Validate & Import</button>
    `;
  } else if (modal.type === "confirm-reset") {
    title = "Reset All Settings to System Defaults";
    bodyHtml = `
      <div class="settings-alert-danger">
        <span class="settings-alert-icon">⚠️</span>
        <div>
          <strong>Caution: High-Risk Action</strong>
          <p>This will erase all custom workspace overrides and restore system defaults across all 16 configuration domains.</p>
        </div>
      </div>
      <p>Are you sure you want to proceed?</p>
    `;
    footerHtml = `
      <button class="btn secondary" data-action="settings-modal-close" type="button">Cancel</button>
      <button class="btn danger" data-action="settings-reset-confirm" type="button">Yes, Reset to System Defaults</button>
    `;
  }

  return `<div class="settings-modal-backdrop" data-action="settings-modal-backdrop-click" role="dialog" aria-modal="true">
    <div class="settings-modal-box">
      <div class="settings-modal-head">
        <h3>${escapeHtml(title)}</h3>
        <button class="settings-modal-close" data-action="settings-modal-close" aria-label="Close dialog">${lucideIcon('x', { size: 16 })}</button>
      </div>
      <div class="settings-modal-body">
        ${bodyHtml}
      </div>
      <div class="settings-modal-footer">
        ${footerHtml}
      </div>
    </div>
  </div>`;
}
