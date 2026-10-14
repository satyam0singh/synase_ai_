// @ts-check
/* Integrations domain views.

   These were src/phase11.js, which installed its own MutationObserver and
   overwrote #main. The markup is unchanged except that its private attribute
   names (data-p11-route / data-p11-action) were normalised to the application
   standard (data-route / data-action) so one delegated listener in app/main.js
   now handles every route group. */

import { state } from "../../shared/state/store.js";
import { escapeHtml } from "../../shared/utils/format.js";
import { lucideIcon } from "../../shared/components/icons.js";

const badge = (value) =>
  `<span class="status ${escapeHtml(value)}">${escapeHtml(
    String(value).replaceAll("_", " ")
  )}</span>`;

const date = (value) => (value ? new Date(value).toLocaleString() : "Never");

const header = (eyebrow, title, copy) =>
  `<div class="breadcrumbs"><span>SYNASE AI</span><span>/</span><b>${title}</b></div><header class="page-header"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="page-copy">${copy}</p></div></header>`;

const tabs = (active) =>
  `<div class="page-tabs input-tabs" aria-label="Integrations navigation"><button class="input-tab ${active === "integrations" ? "active" : ""}" data-route="/app/integrations">Integrations</button><button class="input-tab ${active === "activity" ? "active" : ""}" data-route="/app/activity">Activity</button><button class="input-tab ${active === "audit" ? "active" : ""}" data-route="/app/audit">Audit</button></div>`;

/**
 * @returns {string}
 */
export function integrations() {
  const providers = new Map(state.integrationProviders.map((item) => [item.id, item]));
  const cards = state.integrationConnections
    .map(
      (item) =>
        `<article class="card integration-card"><div class="card-head"><div><h2>${escapeHtml(item.displayName)}</h2><span class="small subtle">${escapeHtml(providers.get(item.providerId)?.name || item.providerId)} · Mock fixture</span></div>${badge(item.connectionStatus)}</div><div class="card-body"><dl class="integration-facts"><div><dt>Authorization</dt><dd>${badge(item.authorizationStatus)}</dd></div><div><dt>Health</dt><dd>${badge(item.health.status)}</dd></div><div><dt>Sync</dt><dd>${badge(item.syncStatus)}</dd></div><div><dt>Last sync</dt><dd>${escapeHtml(date(item.lastSyncedAt))}</dd></div></dl><div class="capability-list">${item.capabilities.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}</div><p class="small subtle">Connection, authorization, health, and synchronization remain separate.</p><div class="control-bar"><button class="button" data-action="integration-health" data-id="${item.id}">Mock health check</button><button class="button primary" data-action="integration-sync" data-id="${item.id}">Mock sync</button><button class="button danger" data-action="integration-disconnect" data-id="${item.id}">Mock disconnect</button></div></div></article>`
    )
    .join("");
  const catalog = state.integrationProviders
    .map(
      (item) =>
        `<article class="card provider-card"><div class="card-body"><div class="catalog-head"><span class="catalog-glyph">${escapeHtml(item.name[0])}</span>${badge(item.availabilityStatus)}</div><h2>${escapeHtml(item.name)}</h2><p>${escapeHtml(item.category.replaceAll("_", " "))} · ${escapeHtml(item.authorizationMethod.toUpperCase())}</p><div class="capability-list">${item.capabilities.map((value) => `<span>${escapeHtml(value)}</span>`).join("")}</div><button class="button" data-action="integration-connect" data-id="${item.id}" ${item.availabilityStatus !== "available" ? "disabled" : ""}>Create mock connection receipt</button></div></article>`
    )
    .join("");
  const runs = state.integrationRuns
    .map(
      (item) =>
        `<tr><td><strong>${escapeHtml(item.id)}</strong><br><span class="small">${escapeHtml(item.type)}</span></td><td>${badge(item.status)}</td><td>${escapeHtml(date(item.startedAt))}</td><td>${item.importedRecords}</td><td>${item.externalContacted ? "Yes" : "No — mock only"}</td></tr>`
    )
    .join("");
  return `${header("Phase 11 · Project integrations", "Integrations", "Typed provider, connection, authorization, health, synchronization, and run projections.")}${tabs("integrations")}<div class="alert">Provisional global route · Selected project: <code>${escapeHtml(state.projectId)}</code>. No provider is contacted and no data is imported.</div>${state.integrationReceipt ? `<div class="alert success" role="status">Mock receipt: ${escapeHtml(state.integrationReceipt.operation)} · external contacted: No · executed: No</div>` : ""}<section><div class="section-title"><div><h2>Project connections</h2><p class="small subtle">Providers and connections remain separate resources.</p></div></div><div class="phase11-grid">${cards}</div></section><section class="phase11-section"><div class="section-title"><h2>Available providers</h2></div><div class="provider-grid">${catalog}</div></section><section class="phase11-section"><div class="section-title"><h2>Integration runs</h2></div><div class="table-wrap"><table><thead><tr><th>Run</th><th>Status</th><th>Started</th><th>Imported</th><th>External contact</th></tr></thead><tbody>${runs}</tbody></table></div></section>`;
}

/**
 * @returns {string}
 */
export function activity() {
  const cards = state.activity
    .map(
      (item) =>
        `<article class="card activity-card"><div class="card-body"><div class="activity-heading"><div><strong>${escapeHtml(item.actor.name)}</strong><span>${escapeHtml(item.actor.type)} · ${escapeHtml(item.source)} event</span></div>${badge(item.outcome)}</div><h2>${escapeHtml(item.action.replaceAll(".", " · "))}</h2><p>${escapeHtml(item.target.type.replaceAll("_", " "))}: <strong>${escapeHtml(item.target.label)}</strong></p><div class="activity-meta"><span>${escapeHtml(item.domain)}</span><time>${escapeHtml(date(item.occurredAt))}</time><span class="proposal">Mock fixture</span></div></div></article>`
    )
    .join("");
  return `${header("Phase 11 · Operational history", "Activity", "Project-scoped operational history with explicit actor, source, domain, outcome, and mock semantics.")}${tabs("activity")}<div class="alert">Activity is not an immutable or security-grade audit record.</div><form class="filter-panel" id="integration-activity-filter"><label>Actor<select name="actor"><option value="">All actors</option><option value="usr_satyam">Satyam Singh</option><option value="usr_maya">Maya Chen</option><option value="system">System</option></select></label><label>Action<input name="action" placeholder="integration"></label><label>Domain<select name="domain"><option value="">All domains</option><option>integrations</option><option>reports</option></select></label><label>From<input type="date" name="from"></label><button class="button">Apply filters</button></form><div class="activity-grid">${cards || `<section class="card empty"><div><h2>No matching activity</h2><p>Adjust filters and retry.</p></div></section>`}</div>`;
}

/**
 * @returns {string}
 */
export function audit() {
  const rows = state.auditEvents
    .map(
      (item) =>
        `<tr><td><button class="link-cell" data-action="audit-detail" data-id="${item.id}">${escapeHtml(item.id)}</button></td><td><strong>${escapeHtml(item.actor.displayName)}</strong><br><span class="small">${escapeHtml(item.actor.type)}</span></td><td>${escapeHtml(item.action)}</td><td>${escapeHtml(item.resource.label)}</td><td>${badge(item.outcome)}</td><td>${escapeHtml(date(item.occurredAt))}</td></tr>`
    )
    .join("");
  const detail = state.auditDetail
    ? `<aside class="card audit-detail"><div class="card-head"><div><h2>Event detail</h2><span class="small subtle">Read-only immutable projection</span></div><button class="icon-btn" data-action="audit-close" aria-label="Close audit detail">${lucideIcon('x', { size: 16 })}</button></div><div class="card-body"><dl class="audit-fields"><div><dt>Event ID</dt><dd>${escapeHtml(state.auditDetail.id)}</dd></div><div><dt>Request ID</dt><dd><code>${escapeHtml(state.auditDetail.requestId)}</code></dd></div><div><dt>Correlation ID</dt><dd><code>${escapeHtml(state.auditDetail.correlationId)}</code></dd></div><div><dt>Actor</dt><dd>${escapeHtml(state.auditDetail.actor.displayName)}</dd></div><div><dt>Metadata</dt><dd><pre>${escapeHtml(JSON.stringify(state.auditDetail.metadata, null, 2))}</pre></dd></div></dl><div class="alert">Mock fixture · immutable: Yes · secret fields redacted or omitted.</div></div></aside>`
    : "";
  return `${header("Phase 11 · Read-only projection", "Audit", "Immutable project-scoped events with safe metadata and request/correlation identifiers.")}${tabs("audit")}<div class="alert">Provisional route · Mock fixtures do not claim security-grade completeness or retention.</div><form class="filter-panel" id="integration-audit-filter"><label>Actor<select name="actor"><option value="">All actors</option><option value="usr_satyam">Satyam Singh</option><option value="usr_maya">Maya Chen</option><option value="system">System</option></select></label><label>Action<input name="action" placeholder="integration"></label><label>Outcome<select name="outcome"><option value="">All outcomes</option><option>success</option><option>accepted</option><option>warning</option></select></label><button class="button">Apply filters</button></form><div class="audit-layout"><div class="table-wrap"><table><thead><tr><th>Event</th><th>Actor</th><th>Action</th><th>Resource</th><th>Outcome</th><th>Timestamp</th></tr></thead><tbody>${rows}</tbody></table></div>${detail}</div>`;
}

/**
 * Body for the current integrations/activity/audit route, including the
 * loading and error states the old renderer owned.
 * @param {string} path
 * @returns {string}
 */
export function integrationsPage(path) {
  if (state.integrationError) {
    return `<section class="card empty"><div><h2>Unable to load</h2><p>${escapeHtml(state.integrationError)}</p><button class="button" data-action="integration-retry">Retry</button></div></section>`;
  }
  if (path.includes("integrations")) return integrations();
  return path === "/app/activity" ? activity() : audit();
}