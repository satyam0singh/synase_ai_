// @ts-check
/**
 * SYNASE AI — Settings Control Plane Sidebar
 * Renders the 16 canonical sections in categorized groups with sharp Antigravity aesthetics.
 */

import { escapeHtml } from "../../shared/components/ui.js";
import { state } from "../../shared/state/store.js";
import { lucideIcon } from "../../shared/components/icons.js";

/**
 * @typedef {{ id: string; label: string; icon: string; desc: string }} SectionMeta
 */

/** @type {Array<{ category: string; sections: SectionMeta[] }>} */
export const SETTINGS_CATEGORIES = [
  {
    category: "Core & General",
    sections: [
      { id: "general", label: "General", icon: lucideIcon("settings", { size: 14 }), desc: "Profile, workspace identity, timezone, and notifications" },
      { id: "workspace", label: "Workspace & Members", icon: lucideIcon("users", { size: 14 }), desc: "Organization identity, team members, roles, and guest access" },
      { id: "appearance", label: "Appearance & Accessibility", icon: lucideIcon("palette", { size: 14 }), desc: "Antigravity theme, layout density, and reduced motion" }
    ]
  },
  {
    category: "Intelligence & Autonomy",
    sections: [
      { id: "ai-models", label: "AI & Models", icon: lucideIcon("sparkles", { size: 14 }), desc: "Decision foundation models, providers, temperature, and fallback" },
      { id: "agents", label: "Agents & Autonomy", icon: lucideIcon("bot", { size: 14 }), desc: "Autonomy tiers, confirmation policy, and chain depth" },
      { id: "tools", label: "Tools & Permissions", icon: lucideIcon("zap", { size: 14 }), desc: "Execution permissions for terminal shell, mutations, and MCP" }
    ]
  },
  {
    category: "Context & Knowledge",
    sections: [
      { id: "memory", label: "Memory & Context", icon: lucideIcon("database", { size: 14 }), desc: "ChromaDB semantic memory, retention windows, and compaction" },
      { id: "vault", label: "Vault & Knowledge", icon: lucideIcon("file-key", { size: 14 }), desc: "Document chunking, knowledge graph indexing, and embeddings" }
    ]
  },
  {
    category: "Integrations & Developer",
    sections: [
      { id: "connectors", label: "Connectors", icon: lucideIcon("blocks", { size: 14 }), desc: "Third-party platform synchronization (GitHub, Linear, Jira, Slack)" },
      { id: "messaging", label: "Messaging", icon: lucideIcon("mail", { size: 14 }), desc: "Webhook broadcasting, notification channels, and quiet hours" },
      { id: "developer", label: "API & Developer", icon: lucideIcon("code", { size: 14 }), desc: "API key generation, wire tracing, and mock simulation controls" },
      { id: "automations", label: "Automations", icon: lucideIcon("repeat", { size: 14 }), desc: "Background task concurrency, scheduled jobs, and pipeline policies" }
    ]
  },
  {
    category: "Governance & System",
    sections: [
      { id: "usage", label: "Usage & Limits", icon: lucideIcon("bar-chart-3", { size: 14 }), desc: "Token consumption quotas, budget alerts, and resource thresholds" },
      { id: "security", label: "Security & Privacy", icon: lucideIcon("shield", { size: 14 }), desc: "MFA enforcement, session idle timeouts, and cryptographic audit" },
      { id: "data", label: "Data & Import/Export", icon: lucideIcon("download", { size: 14 }), desc: "Automated snapshot backups, PII anonymization, and JSON export/import" },
      { id: "advanced", label: "Advanced", icon: lucideIcon("sliders", { size: 14 }), desc: "Experimental research preview flags and diagnostic telemetry" }
    ]
  }
];

/**
 * Finds metadata for a specific section ID.
 * @param {string} sectionId
 * @returns {SectionMeta}
 */
export function getSectionMeta(sectionId) {
  for (const group of SETTINGS_CATEGORIES) {
    const match = group.sections.find((s) => s.id === sectionId);
    if (match) return match;
  }
  return {
    id: sectionId,
    label: sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace(/-/g, " "),
    icon: lucideIcon("settings", { size: 14 }),
    desc: "Configuration section settings"
  };
}

/**
 * Renders the Settings Sidebar navigation.
 * @param {string} activeSectionId
 * @returns {string}
 */
export function settingsSidebar(activeSectionId) {
  const query = (state.settingsSearchQuery || "").toLowerCase().trim();

  const groupsHtml = SETTINGS_CATEGORIES.map((cat) => {
    const visibleSections = cat.sections.filter((s) => {
      if (!query) return true;
      return s.label.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query) || s.id.toLowerCase().includes(query);
    });

    if (visibleSections.length === 0) return "";

    const itemsHtml = visibleSections
      .map((sec) => {
        const isActive = sec.id === activeSectionId;
        return `<button class="settings-nav-item ${isActive ? "is-active" : ""}" data-action="settings-navigate" data-section="${escapeHtml(sec.id)}" type="button">
          <span class="settings-nav-label">
            <span class="settings-nav-icon" aria-hidden="true">${sec.icon}</span>
            <span>${escapeHtml(sec.label)}</span>
          </span>
          <span class="settings-nav-chevron" aria-hidden="true">${lucideIcon('chevron-right', { size: 14 })}</span>
        </button>`;
      })
      .join("");

    return `<div class="settings-nav-group">
      <div class="settings-sidebar-header">
        <span class="settings-sidebar-title">${escapeHtml(cat.category)}</span>
      </div>
      ${itemsHtml}
    </div>`;
  }).join("");

  return `<nav class="settings-sidebar ${state.settingsSidebarOpen ? "is-open" : ""}" aria-label="Settings navigation">
    <div class="settings-sidebar-top">
      <span class="settings-badge-mono">CONTROL PLANE</span>
    </div>
    ${groupsHtml || '<div class="settings-empty-nav">No matching sections found.</div>'}
  </nav>`;
}
