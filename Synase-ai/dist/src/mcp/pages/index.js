// @ts-check
/* MCP V2: observability, executions, catalogs and discovery. */
import { state } from "../../shared/state/store.js";
import { routes } from "../../app/paths.js";
import {
  pageHeader,
  status,
  notFound,
  escapeHtml,
  metricCard
} from "../../shared/components/ui.js";
export function mcpTabs(view) {
  const tabs = [["overview","Overview"],["executions","Executions"],["tools","Tools"],["models","Models"],["discovery","Discovery"]];
  return `<div class="input-tabs page-tabs">${tabs.map(([key,label]) => `<button class="input-tab ${view === key ? "active" : ""}" data-route="/app/mcp/${key}">${label}</button>`).join("")}</div>`;
}

export function mcpOverviewView() {
  const metrics = [
    { label: "Requests", value: String(state.mcpOverview?.requestCount ?? "—"), trend: "Mock catalog", tone: "neutral" },
    { label: "Completed / cached", value: String(state.mcpOverview?.completedCount ?? "—"), trend: "Trace metadata", tone: "positive" },
    { label: "Avg. confidence", value: state.mcpOverview ? `${Math.round(state.mcpOverview.averageConfidence * 100)}%` : "—", trend: "Normalized 0–1", tone: "neutral" },
    { label: "Healthy servers", value: String(state.mcpOverview?.healthyServers ?? "—"), trend: `${state.mcpServers.length} known`, tone: "warning" }
  ];
  return `<section class="metrics">${metrics.map(metricCard).join("")}</section>
    <div class="dashboard-grid"><article class="card"><div class="card-head"><h2>Recent MCP requests</h2><button class="button ghost" data-route="/app/mcp/executions">View traces</button></div><div class="card-body">${mcpRequestTable(state.mcpRequests.slice(0,5))}</div></article>
    <article class="card"><div class="card-head"><h2>Inventory</h2></div><div class="card-body inventory-list"><div><span>Models</span><b>${state.mcpModels.length}</b></div><div><span>Tools</span><b>${state.mcpTools.length}</b></div><div><span>Servers</span><b>${state.mcpServers.length}</b></div><div><span>Directories</span><b>${state.mcpDirectories.length}</b></div></div></article></div>`;
}

export function mcpRequestTable(requests) {
  return `<div class="mcp-request-list">${requests.map((request) => `<button class="mcp-request ${request.id === state.mcpRequestId ? "active" : ""}" data-action="select-mcp-request" data-request-id="${request.id}"><div><strong>${escapeHtml(request.id)}</strong><span>${escapeHtml(request.detectedLayer || "unknown")} · ${escapeHtml(request.payloadFormat)}</span></div>${status(request.status)}<b>${Math.round(request.confidence * 100)}%</b></button>`).join("")}</div>`;
}

export function mcpExecutionsView() {
  const request = state.mcpRequests.find((item) => item.id === state.mcpRequestId);
  return `<div class="mcp-layout"><aside class="card"><div class="card-head"><h2>Requests</h2></div>${mcpRequestTable(state.mcpRequests)}</aside>
    <section class="card"><div class="card-head"><div><h2>${escapeHtml(request?.id || "Select a request")}</h2><span class="small subtle">${request ? `${request.detectedLayer} layer · validation ${request.validationStatus}` : ""}</span></div>${request ? status(request.status) : ""}</div>
    <div class="trace-list">${state.mcpTrace.map((stage) => `<div class="trace-stage"><span class="trace-seq">${stage.sequence}</span><div><strong>${escapeHtml(stage.chamber.replaceAll("_"," "))}</strong><p>${escapeHtml(stage.summary)}</p></div><div>${status(stage.status)}<small>${stage.durationMs ? `${stage.durationMs} ms` : "—"}</small></div></div>`).join("")}</div>
    ${request ? `<div class="safe-payload"><b>Safe trace metadata</b><code>{ layer: \"${escapeHtml(request.detectedLayer)}\", format: \"${escapeHtml(request.payloadFormat)}\", credentials: \"[REDACTED]\" }</code></div>` : ""}</section></div>`;
}

export function mcpCatalogView(kind) {
  const models = kind === "models";
  const items = models ? state.mcpModels : state.mcpTools;
  return `<div class="catalog-grid">${items.map((item) => `<article class="card catalog-card"><div class="card-body"><div class="catalog-head"><span class="catalog-glyph">${models ? "M" : "T"}</span>${status(item.availabilityStatus)}</div><h2>${escapeHtml(item.name)}</h2><p>${models ? `${escapeHtml(item.provider)} · ${item.contextWindow?.toLocaleString() || "—"} context` : `${escapeHtml(item.type)} · ${(item.capabilities || []).join(", ")}`}</p><div class="small subtle">Safe catalog metadata only</div></div></article>`).join("")}</div>`;
}

export function mcpDiscoveryView() {
  return `<div class="workflow-grid"><article class="card"><div class="card-head"><h2>Directories</h2></div><div class="discovery-list">${state.mcpDirectories.map((directory) => `<div class="discovery-row"><div><strong>${escapeHtml(directory.name)}</strong><span>${escapeHtml(directory.type)} · ${escapeHtml(directory.healthStatus)}</span></div>${status(directory.status)}<button class="button" data-action="discover-directory" data-directory-id="${directory.id}" ${directory.status !== "active" ? "disabled" : ""}>Discover</button></div>`).join("")}</div></article>
    <article class="card"><div class="card-head"><h2>Servers</h2></div><div class="discovery-list">${state.mcpServers.map((server) => `<div class="discovery-row"><div><strong>${escapeHtml(server.name)}</strong><span>${escapeHtml(server.transportType)} · ${server.toolCount} tools</span></div>${status(server.healthStatus)}<button class="button ghost" data-action="server-health" data-server-id="${server.id}">Health check</button></div>`).join("")}</div></article></div>`;
}

export function mcpPage(view = "overview") {
  return `${pageHeader("MCP V2", view === "overview" ? "MCP observability" : `MCP ${view}`, "Inspect safe execution metadata, catalogs, routing traces, validation, confidence, discovery, and server health.")}
    <div class="alert">Mock MCP workspace. No directory, server, model, agent, or tool is contacted, and credentials never enter frontend display models.</div>
    ${mcpTabs(view)}
    ${view === "overview" ? mcpOverviewView() : view === "executions" ? mcpExecutionsView() : view === "tools" ? mcpCatalogView("tools") : view === "models" ? mcpCatalogView("models") : mcpDiscoveryView()}`;
}
