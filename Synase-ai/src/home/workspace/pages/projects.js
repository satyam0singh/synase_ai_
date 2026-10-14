// @ts-check
/* Project list, creation and overview. */
import { state } from "../../../shared/state/store.js";
import { routes } from "../../../app/paths.js";
import {
  pageHeader,
  status,
  notFound,
  escapeHtml
} from "../../../shared/components/ui.js";
import { lucideIcon } from "../../../shared/components/icons.js";
export function projectRows(projects, compact = false) {
  if (!projects.length) return `<div class="empty"><div><div class="empty-icon">${lucideIcon('folder-kanban', { size: 28 })}</div><h2>No projects found</h2><p>Create a project or adjust your filters. Empty states always explain the next action.</p></div></div>`;
  if (compact) return `<div class="project-list">${projects.slice(0, 5).map((project) => `
    <button class="project-row" data-route="/app/projects/${project.id}/overview">
      <div><div class="project-title"><span class="project-glyph"></span>${escapeHtml(project.name)}</div><p class="project-desc">${escapeHtml(project.description)}</p></div>
      ${status(project.lifecycleStatus)}
    </button>`).join("")}</div>`;
  return `<div class="table-wrap"><table>
    <thead><tr><th>Project</th><th>Status</th><th>Role</th><th>Updated</th><th></th></tr></thead>
    <tbody>${projects.map((project) => `<tr>
      <td><strong>${escapeHtml(project.name)}</strong><br><span class="small">${escapeHtml(project.description)}</span></td>
      <td>${status(project.lifecycleStatus)}</td><td>${escapeHtml(project.role.replaceAll("_", " "))}</td>
      <td>${new Date(project.updatedAt).toLocaleDateString()}</td>
      <td><button class="button ghost" data-route="/app/projects/${project.id}/overview">Open</button></td>
    </tr>`).join("")}</tbody></table></div>`;
}

export function projectsPage() {
  return `${pageHeader("Project workspace", "Projects", "Create, filter, and enter projects without coupling the frontend to database tables.", `<button class="button primary" data-route="${routes.createProject}">${lucideIcon('plus', { size: 14 })} New project</button>`)}
    <div class="toolbar">
      <input class="field-inline search" id="project-search" type="search" placeholder="Search projects" aria-label="Search projects">
      <select class="field-inline" id="project-status" aria-label="Filter project status">
        <option value="">All lifecycle states</option><option>active</option><option>draft</option><option>paused</option><option>completed</option><option>archived</option>
      </select>
    </div>
    <div id="project-results">${projectRows(state.projects)}</div>`;
}

export function createProjectPage() {
  return `${pageHeader("Project workspace", "Create project", "Start with a small, typed contract. Repository and ingestion setup remain outside this phase.")}
    <section class="card form-card">
      <div class="alert">This build uses the deterministic mock adapter. A successful response represents contract behavior—not a live backend write.</div>
      <form id="create-project-form">
        <div class="form-grid">
          <div class="field full"><label for="project-workspace">Workspace</label><select id="project-workspace" name="workspaceId" required>${state.workspaces.map((w) => `<option value="${w.id}" ${w.id === state.workspaceId ? "selected" : ""}>${escapeHtml(w.name)}</option>`).join("")}</select></div>
          <div class="field full"><label for="project-name">Project name</label><input id="project-name" name="name" required maxlength="80" placeholder="e.g. Decision Intelligence Console"><small>Required · 80 characters maximum</small></div>
          <div class="field full"><label for="project-description">Description</label><textarea id="project-description" name="description" maxlength="360" placeholder="What is this project?"></textarea></div>
          <div class="field full"><label for="project-goal">Goal</label><textarea id="project-goal" name="goal" maxlength="360" placeholder="What outcome should this project drive?"></textarea></div>
        </div>
        <div id="form-message"></div>
        <div class="form-actions"><button type="button" class="button ghost" data-route="${routes.projects}">Cancel</button><button type="submit" class="button primary">Create project</button></div>
      </form>
    </section>`;
}

export function projectOverviewPage(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return notFound("Project not found", "This project does not exist or is not available in the selected workspace.");
  state.projectId = project.id;
  return `${pageHeader("Project overview", project.name, "Structured project context with honest availability states.", `<button class="button" data-route="/app/projects/${project.id}/settings">Project settings</button>`)}
    <article class="card overview-hero">
      <div><div class="cluster">${status(project.lifecycleStatus)}<span class="status">${escapeHtml(project.role.replaceAll("_", " "))}</span></div>
        <p class="page-copy">${escapeHtml(project.description || "No description provided.")}</p>
        <div class="overview-meta"><span>Goal<b>${escapeHtml(project.goal || "Not defined")}</b></span><span>Workspace<b>${escapeHtml(state.workspaces.find((w) => w.id === project.workspaceId)?.name || "Unknown")}</b></span><span>Updated<b>${new Date(project.updatedAt).toLocaleDateString()}</b></span></div>
      </div>
    </article>
    <section class="placeholder-grid" aria-label="Project modules">
      <article class="placeholder">
        <h3>Repository</h3>
        <p>Inspect connected repositories, branch snapshots, and source tree previews.</p>
        <button class="button secondary" data-route="/app/projects/${project.id}/repository">Open repository</button>
      </article>
      <article class="placeholder">
        <h3>Analysis runs</h3>
        <p>Monitor workflow tasks, mock streaming events, and execution step lifecycles.</p>
        <button class="button secondary" data-route="/app/projects/${project.id}/runs">View execution runs</button>
      </article>
      <article class="placeholder">
        <h3>Decision reports</h3>
        <p>Review synthesized architecture and decision reports for this project.</p>
        <button class="button secondary" data-route="/app/reports">View decision reports</button>
      </article>
    </section>`;
}
