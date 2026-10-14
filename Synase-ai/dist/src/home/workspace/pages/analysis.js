// @ts-check
/* Conversation workspace and typed analysis requests. */
import { state } from "../../../shared/state/store.js";
import { routes } from "../../../app/paths.js";
import {
  pageHeader,
  status,
  notFound,
  escapeHtml
} from "../../../shared/components/ui.js";
import { lucideIcon } from "../../../shared/components/icons.js";
export function contextOptions(items, selected = []) {
  return items.map((item) => `<option value="${item.id}" ${selected.includes(item.id) ? "selected" : ""}>${escapeHtml(item.name || item.fullName)}</option>`).join("");
}

export function messageThread() {
  if (!state.conversationId) return `<div class="empty"><div><div class="empty-icon">${lucideIcon('messages-square', { size: 28 })}</div><h2>Select a conversation</h2><p>Choose an active project conversation or create a new one.</p></div></div>`;
  if (!state.messages.length) return `<div class="empty"><div><div class="empty-icon">${lucideIcon('message-square', { size: 28 })}</div><h2>No messages yet</h2><p>Add project context or start a typed analysis request.</p></div></div>`;
  return `<div class="message-thread">${state.messages.map((message) => `
    <article class="message ${message.role}">
      <div class="message-meta"><span>${escapeHtml(message.role)}</span>${message.mock ? `<b>Mock receipt</b>` : ""}<time>${new Date(message.createdAt).toLocaleString()}</time></div>
      <p>${escapeHtml(message.text || "")}</p>
      ${(message.assetIds?.length || message.repositoryIds?.length) ? `<div class="message-refs">${message.assetIds.map((id) => `<span>Asset · ${escapeHtml(state.assets.find((item) => item.id === id)?.name || id)}</span>`).join("")}${message.repositoryIds.map((id) => `<span>Repository · ${escapeHtml(state.repositories.find((item) => item.id === id)?.fullName || id)}</span>`).join("")}</div>` : ""}
      <div class="message-status">${status(message.status)}</div>
    </article>`).join("")}</div>`;
}

export function conversationWorkspace(projectId) {
  const active = state.conversations.find((item) => item.id === state.conversationId);
  return `<div class="conversation-layout">
    <aside class="conversation-sidebar card">
      <div class="card-head"><div><h2>Conversations</h2><span class="small subtle">${state.conversations.length} sessions</span></div><button class="icon-btn" data-action="toggle-conversation-form" aria-label="New conversation">${lucideIcon('plus', { size: 14 })}</button></div>
      <form id="new-conversation-form" class="mini-form hidden-panel"><input name="title" placeholder="Conversation title" required><button class="button primary" type="submit">Create</button></form>
      <div class="conversation-list">${state.conversations.length ? state.conversations.map((session) => `<button class="conversation-item ${session.id === state.conversationId ? "active" : ""}" data-action="select-conversation" data-conversation-id="${session.id}"><strong>${escapeHtml(session.title || "Untitled")}</strong><span>${escapeHtml(session.status)} · ${new Date(session.updatedAt).toLocaleDateString()}</span></button>`).join("") : `<div class="card-body small muted">No conversation sessions.</div>`}</div>
    </aside>
    <section class="card conversation-main">
      <div class="card-head"><div><h2>${escapeHtml(active?.title || "Conversation")}</h2><span class="small subtle">Project-scoped context discussion</span></div>${active ? status(active.status) : ""}</div>
      ${messageThread()}
      ${active ? `<form id="message-form" class="message-composer">
        <div class="field"><label for="message-text">Message</label><textarea id="message-text" name="text" required placeholder="Describe the product or engineering decision to explore"></textarea></div>
        <div class="attachment-grid">
          <div class="field"><label for="message-assets">Asset references</label><select id="message-assets" name="assetIds" multiple>${contextOptions(state.assets)}</select></div>
          <div class="field"><label for="message-repositories">Repository references</label><select id="message-repositories" name="repositoryIds" multiple>${contextOptions(state.repositories)}</select></div>
        </div>
        <div id="conversation-form-message"></div>
        <div class="form-actions"><span class="small subtle">Mock adapter: no AI response will run.</span><button class="button primary" type="submit">Send message</button></div>
      </form>` : ""}
    </section>
  </div>`;
}

export function analysisComposer(projectId) {
  return `<section class="card form-card analysis-form-card">
    <div class="alert">Submitting creates a mock queued receipt only. Intent detection, orchestration, model/tool work, validation, confidence, and report generation do not run in Phase 4.</div>
    <form id="analysis-request-form">
      <div class="form-grid">
        <div class="field full"><label for="analysis-text">Analysis request</label><textarea id="analysis-text" name="requestText" required placeholder="Review the architecture implications of this PRD"></textarea></div>
        <div class="field"><label for="analysis-type">Request type</label><select id="analysis-type" name="requestType" required><option value="architecture_review">Architecture review</option><option value="requirement_analysis">Requirement analysis</option><option value="repository_review">Repository review</option><option value="risk_assessment">Risk assessment</option><option value="security_analysis">Security analysis</option><option value="testing_plan">Testing plan</option></select></div>
        <div class="field"><label for="analysis-priority">Priority</label><select id="analysis-priority" name="priority"><option value="low">Low</option><option value="normal" selected>Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
        <div class="field"><label for="analysis-strategy">Execution strategy</label><select id="analysis-strategy" name="executionStrategy"><option value="sequential">Sequential</option><option value="parallel">Parallel</option><option value="hybrid" selected>Hybrid</option></select></div>
        <div class="field"><label for="analysis-conversation">Conversation</label><select id="analysis-conversation" name="conversationId"><option value="">No linked conversation</option>${state.conversations.map((item) => `<option value="${item.id}" ${item.id === state.conversationId ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select></div>
        <div class="field"><label for="analysis-assets">Assets</label><select id="analysis-assets" name="assetIds" multiple>${contextOptions(state.assets)}</select><small>Use Ctrl/Cmd to select multiple.</small></div>
        <div class="field"><label for="analysis-repositories">Repositories</label><select id="analysis-repositories" name="repositoryIds" multiple>${contextOptions(state.repositories)}</select><small>References only; no source is fetched.</small></div>
      </div>
      <div id="analysis-form-message"></div>
      <div class="form-actions"><button class="button primary" type="submit">Create analysis request</button></div>
    </form>
  </section>`;
}

export function requestHistory() {
  if (!state.analysisRequests.length) return `<section class="card empty"><div><div class="empty-icon">↳</div><h2>No analysis requests</h2><p>Create a typed request. Phase 5 will later provide workflow execution views.</p></div></section>`;
  return `<div class="table-wrap"><table><thead><tr><th>Request</th><th>Type</th><th>Priority</th><th>Status</th><th>Receipt</th><th></th></tr></thead><tbody>${state.analysisRequests.map((request) => `<tr>
    <td><strong>${escapeHtml(request.requestText)}</strong><br><span class="small">${new Date(request.createdAt).toLocaleString()}${request.mock ? " · Mock" : ""}</span></td>
    <td>${escapeHtml(request.requestType.replaceAll("_", " "))}</td><td>${escapeHtml(request.priority)}</td><td>${status(request.status)}</td>
    <td><code>${escapeHtml(request.id)}</code><br><span class="small">${escapeHtml(request.workflowId || "No workflow")}</span></td>
    <td>${["received","validated","queued","processing"].includes(request.status) ? `<button class="button ghost" data-action="cancel-request" data-request-id="${request.id}">Cancel</button>` : ""}</td>
  </tr>`).join("")}</tbody></table></div>`;
}

export function analysisPage(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return notFound("Project not found", "Conversation and analysis cannot be loaded for an unavailable project.");
  state.projectId = project.id;
  const tabs = [["conversation","Conversation"],["compose","New analysis"],["history","Request history"]];
  return `${pageHeader("Decision workspace", "Conversation & analysis", `Organize project context and create typed analysis requests for ${project.name}. Workflow execution begins in Phase 5.`)}
    <div class="alert">Provisional route · Mock adapter active. No AI model, agent, tool, workflow, validation, confidence, or report generation is running.</div>
    <div class="input-tabs page-tabs" role="tablist">${tabs.map(([key,label]) => `<button class="input-tab ${state.analysisTab === key ? "active" : ""}" role="tab" aria-selected="${state.analysisTab === key}" data-action="analysis-tab" data-tab="${key}">${label}</button>`).join("")}</div>
    ${state.analysisTab === "conversation" ? conversationWorkspace(projectId) : state.analysisTab === "compose" ? analysisComposer(projectId) : requestHistory()}`;
}
