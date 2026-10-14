// @ts-check
/* Workflow execution runs and mock event playback. */
import { state } from "../../../shared/state/store.js";
import { routes } from "../../../app/paths.js";
import {
  pageHeader,
  status,
  notFound,
  escapeHtml
} from "../../../shared/components/ui.js";
export function workflowList() {
  return `<div class="run-list">${state.workflows.map((workflow) => `<button class="run-item ${workflow.id === state.workflowId ? "active" : ""}" data-action="select-workflow" data-workflow-id="${workflow.id}">
    <span>${status(workflow.status)}<b>${escapeHtml(workflow.id)}</b></span><small>${escapeHtml(workflow.currentStage || "Not started")} · ${workflow.progressPercent}%</small>
  </button>`).join("")}</div>`;
}

export function workflowDetail() {
  const workflow = state.workflows.find((item) => item.id === state.workflowId);
  if (!workflow) return `<section class="card empty"><div><div class="empty-icon">▶</div><h2>Select a workflow</h2><p>Choose a run to inspect its authoritative snapshot and event history.</p></div></section>`;
  const terminal = ["completed","failed","cancelled"].includes(workflow.status);
  return `<section class="workflow-detail">
    <article class="card run-summary">
      <div class="card-head"><div><h2>${escapeHtml(workflow.id)}</h2><span class="small subtle">Request ${escapeHtml(workflow.requestId)} · ${escapeHtml(workflow.executionStrategy)}</span></div><div class="cluster">${status(workflow.status)}<span class="connection ${state.streamState}">${escapeHtml(state.streamState)}</span></div></div>
      <div class="card-body">
        <div class="progress-head"><span>${escapeHtml(workflow.currentStage || "Not started").replaceAll("_"," ")}</span><b>${workflow.progressPercent}%</b></div>
        <div class="progress-track" aria-label="Authoritative workflow progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${workflow.progressPercent}" role="progressbar"><span style="width:${workflow.progressPercent}%"></span></div>
        <div class="control-bar">
          <button class="button" data-action="workflow-control" data-control="${workflow.status === "paused" ? "resume" : "pause"}" ${terminal ? "disabled" : ""}>${workflow.status === "paused" ? "Resume" : "Pause"}</button>
          <button class="button danger" data-action="workflow-control" data-control="cancel" ${terminal ? "disabled" : ""}>Cancel</button>
          <button class="button primary" data-action="next-mock-event" ${terminal ? "disabled" : ""}>Emit next mock event</button>
        </div>
        <p class="small subtle">Mock playback is user-triggered. No model, tool, agent, or backend workflow is running.</p>
      </div>
    </article>
    <div class="workflow-grid">
      <article class="card"><div class="card-head"><h2>Tasks</h2><span class="small subtle">${state.workflowTasks.length} tasks</span></div><div class="task-list">${state.workflowTasks.map((task) => `<div class="task-row"><span class="task-seq">${task.sequence}</span><div><strong>${escapeHtml(task.name)}</strong><small>${escapeHtml(task.layer)} · ${task.progressPercent}%</small></div>${status(task.status)}</div>`).join("")}</div></article>
      <article class="card"><div class="card-head"><h2>Event stream</h2><button class="button ghost" data-action="toggle-stream">${state.streamState === "open" ? "Disconnect" : "Connect mock stream"}</button></div><div class="event-list">${state.workflowEvents.slice().reverse().map((event) => `<div class="event-row"><span>${event.sequence}</span><div><strong>${escapeHtml(event.eventType)}</strong><small>${escapeHtml(event.payload.stage || event.payload.status || "event")}</small></div><time>${new Date(event.occurredAt).toLocaleTimeString()}</time></div>`).join("")}</div></article>
    </div>
  </section>`;
}

export function runsPage(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return notFound("Project not found", "Workflow runs cannot be loaded for an unavailable project.");
  state.projectId = project.id;
  return `${pageHeader("Workflow execution", "Execution runs", `Inspect authoritative workflow snapshots and explicit mock SSE playback for ${project.name}.`)}
    <div class="alert">Mock SSE test harness. Events advance only when you click “Emit next mock event”; no live AI execution is represented.</div>
    <div class="runs-layout"><aside class="card"><div class="card-head"><div><h2>Runs</h2><span class="small subtle">${state.workflows.length} workflows</span></div></div>${workflowList()}</aside>${workflowDetail()}</div>`;
}
