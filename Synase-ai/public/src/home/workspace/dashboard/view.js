// @ts-check
/* Decision dashboard for /app/dashboard.

   This was src/phase12.js, which raced the main router for #main. In practice it
   always won on this route, so it is now the declared owner of /app/dashboard
   and the superseded Phase 2 aggregate has been removed.

   The derived collections and the template below are copied verbatim from
   src/phase12.js. The only change is the `go()` helper, which now emits the
   application-standard `data-route` attribute instead of the plugin-private
   `data-p12-route`, so one delegated listener in app/main.js handles every
   route group. */

import { state } from "../../../shared/state/store.js";
import { escapeHtml } from "../../../shared/utils/format.js";
import { lucideIcon } from "../../../shared/components/icons.js";

/* The extracted lines below call esc(); alias keeps them byte-identical. */
const esc = escapeHtml;

const badge = (value) =>
  `<span class="status ${esc(String(value))}">${esc(
    String(value).replaceAll("_", " ")
  )}</span>`;

const formatDate = (value) => new Date(value).toLocaleString();

/* Emits a standard route attribute. */
const go = (href) => `data-route="${esc(href)}"`;

const attentionIcon = (kind) => {
  switch (kind) {
    case "approval": return lucideIcon('shield-check', { size: 16 });
    case "workflow": return lucideIcon('play', { size: 15 });
    case "finding": return lucideIcon('alert-circle', { size: 15 });
    case "integration": return lucideIcon('blocks', { size: 15 });
    case "context": return lucideIcon('database', { size: 15 });
    default: return lucideIcon('alert-circle', { size: 15 });
  }
};

/**
 * @param {{id?: string, label?: string, value?: unknown, detail?: string}} item
 * @returns {string}
 */
function metricCard(item) {
  const routesByMetric = {
    attention: "/app/approvals",
    active_projects: "/app/projects",
    workflow_health: `/app/projects/${state.projectId || "prj_platform"}/runs`,
    approvals: "/app/approvals"
  };
  const href = routesByMetric[item.id || ""] || "";
  return `<article class="card p12-metric ${href ? "is-clickable" : ""}" ${href ? go(href) : ""}>
    <div class="card-body">
      <span class="small subtle">${esc(item.label)}</span>
      <strong>${esc(item.value)}</strong>
      <span>${esc(item.detail)}</span>
    </div>
  </article>`;
}

/**
 * @param {any} data
 * @returns {string}
 */
export function dashboardView(data) {
  const metrics = data.metrics.map(metricCard).join("");
  const attention = data.attention.map((item) => `<button type="button" class="p12-attention" ${go(item.href)}><span class="p12-attention-icon" aria-hidden="true">${attentionIcon(item.kind)}</span><span><strong>${esc(item.title)}</strong><small>${esc(item.detail)}</small><small>${item.proposed ? "AI-proposed · " : ""}Executed: ${item.executed ? "Yes" : "No"}</small></span>${badge(item.severity)}</button>`).join("");
  const projects = data.projects.map((item) => `<tr><td><strong>${esc(item.name)}</strong><br><span class="small subtle">${esc(item.summary)}</span></td><td>${badge(item.lifecycle)}</td><td>${badge(item.health)}</td><td><button class="link-cell button secondary" ${go(`/app/projects/${item.id}/overview`)}>Open</button></td></tr>`).join("");
  const workflows = data.workflows.map((item) => `<article class="p12-run" ${go(`/app/projects/${data.selectedProjectId || "prj_platform"}/runs`)} role="button" tabindex="0" title="View workflow runs"><div><strong>${esc(item.label)}</strong><small>${esc(item.id)}</small></div>${badge(item.status)}<div class="p12-progress" aria-label="${esc(item.progressPercent)} percent authoritative progress"><span style="width:${Math.max(0, Math.min(100, item.progressPercent))}%"></span></div><b>${esc(item.progressPercent)}%</b></article>`).join("");
  const readiness = data.readiness.map((item) => `<div class="p12-readiness" ${go("/app/integrations")} role="button" tabindex="0" title="Manage integrations"><span>${esc(item.label)}</span>${badge(item.status)}<small>${esc(item.detail)}</small></div>`).join("");
  const activity = data.activity.map((item) => `<li ${go("/app/activity")} role="button" tabindex="0" title="View operational activity" style="cursor:pointer"><span class="p12-activity-dot"></span><div><strong>${esc(item.actor)}</strong> ${esc(item.action)}<small>${esc(item.source)} event · ${esc(formatDate(item.occurredAt))} · Operational history, not audit</small></div></li>`).join("");
  return `<div class="breadcrumbs"><span>SYNASE AI</span><span>/</span><b>Dashboard</b></div><header class="page-header p12-header"><div><div class="eyebrow">Phase 12 · Decision intelligence overview</div><h1>Workspace dashboard</h1><p class="page-copy">Attention, projects, workflows, outputs, and integration readiness without fabricated backend aggregation.</p></div><span class="p12-mode">Mock adapter · selected project scope</span></header><div class="alert">Workspace aggregate contract unresolved. This deterministic view is labeled <strong>${esc(data.scope.replaceAll("_", " "))}</strong>; it is not proof of backend connectivity.</div><section class="p12-metrics" aria-label="Workspace metrics">${metrics}</section><div class="p12-layout"><section class="card p12-panel" id="needs-attention-section"><div class="card-head"><div><h2>Needs attention</h2><span class="small subtle">Review queue · no downstream execution</span></div><b>${data.attention.length}</b></div><div class="card-body p12-attention-list">${attention}</div></section><section class="card p12-panel"><div class="card-head"><div><h2>Integration readiness</h2><span class="small subtle">Configuration, contracts, and connectivity stay distinct</span></div>${badge("partial")}</div><div class="card-body p12-readiness-list">${readiness}</div></section></div><div class="p12-layout p12-layout-wide"><section class="card p12-panel"><div class="card-head"><div><h2>Project portfolio</h2><span class="small subtle">Lifecycle and health are separate</span></div><button class="button" ${go("/app/projects")}>View all</button></div><div class="table-wrap"><table><thead><tr><th>Project</th><th>Lifecycle</th><th>Health</th><th></th></tr></thead><tbody>${projects}</tbody></table></div></section><section class="card p12-panel"><div class="card-head"><div><h2>Workflow status</h2><span class="small subtle">Authoritative fixture progress only</span></div><button class="button" ${go(`/app/projects/${data.selectedProjectId}/runs`)}>Runs</button></div><div class="card-body p12-runs">${workflows}</div></section></div><div class="p12-layout"><section class="card p12-panel"><div class="card-head"><div><h2>Reports and approvals</h2><span class="small subtle">Approval never implies execution</span></div><button class="button" ${go("/app/approvals")}>Review</button></div><div class="card-body p12-output-grid"><div ${go("/app/reports")} role="button" tabindex="0" title="View reports"><span>Review required</span><strong>${data.outputs.reports.reviewRequired}</strong></div><div ${go("/app/approvals")} role="button" tabindex="0" title="View approvals"><span>Pending approvals</span><strong>${data.outputs.approvals.pending}</strong></div><div ${go("/app/reports")} role="button" tabindex="0" title="View published reports"><span>Published</span><strong>${data.outputs.reports.published}</strong></div><div ${go("/app/approvals")} role="button" tabindex="0" title="View executed approvals"><span>Executed</span><strong>${data.outputs.approvals.executed}</strong></div></div></section><section class="card p12-panel"><div class="card-head"><div><h2>Recent activity</h2><span class="small subtle">Operational history · distinct from audit</span></div><button class="button" ${go("/app/activity")}>Activity</button></div><div class="card-body"><ul class="p12-activity">${activity}</ul></div></section></div><footer class="p12-safety"><strong>Validation boundary</strong><span>External contacted: No</span><span>Imported records: 0</span><span>Secrets exposed: No</span><span>Downstream actions executed: No</span></footer>`;
}

/**
 * Body for the Work view (/app/dashboard) including its loading and error
 * states. Wraps the verbatim dashboardView template with a switch back to Chat.
 * @returns {string}
 */
export function decisionDashboardPage() {
  const switchToChat = `<div class="p12-surface-switch">
    <button class="p12-surface-tab is-active" aria-current="page">Work</button>
    <button class="p12-surface-tab" data-route="/app/chat">Switch to Chat</button>
  </div>`;

  if (state.decisionDashboardError) {
    return `${switchToChat}<section class="card empty"><div><h1>Dashboard unavailable</h1><p>${esc(state.decisionDashboardError)}</p><button class="button primary" data-action="dashboard-retry">Retry</button></div></section>`;
  }
  if (!state.decisionDashboard) {
    return `${switchToChat}<div class="loading"><div><div class="spinner"></div>Loading dashboard contract…</div></div>`;
  }
  return switchToChat + dashboardView(state.decisionDashboard);
}
