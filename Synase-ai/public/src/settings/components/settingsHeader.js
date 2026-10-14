// @ts-check
/**
 * SYNASE AI — Settings Control Plane Header
 * Header with breadcrumbs, section title, description, and search filter input.
 */

import { escapeHtml } from "../../shared/components/ui.js";
import { state } from "../../shared/state/store.js";
import { lucideIcon } from "../../shared/components/icons.js";
import { getSectionMeta, SETTINGS_CATEGORIES } from "./settingsSidebar.js";

/**
 * @param {string} sectionId
 * @returns {string}
 */
export function settingsHeader(sectionId) {
  const meta = getSectionMeta(sectionId);
  const searchQuery = escapeHtml(state.settingsSearchQuery || "");

  const optionsHtml = SETTINGS_CATEGORIES.map((cat) => {
    const opts = cat.sections
      .map((s) => `<option value="${s.id}" ${s.id === sectionId ? "selected" : ""}>${s.icon} ${escapeHtml(s.label)}</option>`)
      .join("");
    return `<optgroup label="${escapeHtml(cat.category)}">${opts}</optgroup>`;
  }).join("");

  return `<header class="settings-header">
    <div class="settings-breadcrumbs">
      <span>SYNASE AI</span>
      <span>/</span>
      <span>Settings</span>
      <span>/</span>
      <b>${escapeHtml(meta.label)}</b>
    </div>
    <div class="settings-mobile-section-picker">
      <select class="settings-mobile-select" data-action="settings-switch-section" aria-label="Switch settings section">
        ${optionsHtml}
      </select>
    </div>
    <div class="settings-header-top">
      <div>
        <h1 class="settings-title">${escapeHtml(meta.label)}</h1>
        <p class="settings-subtitle">${escapeHtml(meta.desc)}</p>
      </div>
      <div class="settings-header-actions">
        <div class="settings-search-bar" role="search">
          <span class="settings-search-icon" aria-hidden="true">${lucideIcon('search', { size: 14 })}</span>
          <input
            type="search"
            class="settings-search-input"
            placeholder="Filter settings..."
            aria-label="Filter settings"
            value="${searchQuery}"
            data-action="settings-search-input"
          />
          ${
            searchQuery
              ? `<button class="settings-search-clear" data-action="settings-search-clear" aria-label="Clear search">${lucideIcon('x', { size: 14 })}</button>`
              : ""
          }
        </div>
      </div>
    </div>
  </header>`;
}
