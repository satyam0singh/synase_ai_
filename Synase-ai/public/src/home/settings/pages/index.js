// @ts-check
/* Workspace and project settings. */
import { state } from "../../../shared/state/store.js";
import { routes } from "../../../app/paths.js";
import {
  pageHeader,
  status,
  notFound,
  escapeHtml
} from "../../../shared/components/ui.js";
export function workspaceSettingsPage() {
  const workspace = state.workspaces.find((item) => item.id === state.workspaceId);
  return `${pageHeader("Workspace administration", "Workspace settings", "Workspace defaults and destructive behavior remain permission-aware and contract-driven.")}
    <div class="alert">Provisional route. Ownership transfer, archive, and deletion safeguards must be frozen before activation.</div>
    <section class="card form-card"><form id="workspace-settings-form">
      <div class="form-grid">
        <div class="field full"><label for="workspace-name">Workspace name</label><input id="workspace-name" value="${escapeHtml(workspace?.name)}" disabled><small>Read-only in this frontend-only build.</small></div>
        <div class="field full"><label for="workspace-description">Description</label><textarea id="workspace-description" disabled>${escapeHtml(workspace?.description)}</textarea></div>
      </div>
      <div class="form-actions"><button type="button" class="button" disabled>Save changes</button></div>
    </form></section>`;
}

export function projectSettingsPage(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return notFound("Project not found", "Settings cannot be loaded for an unavailable project.");
  const statuses = ["active", "draft", "paused", "completed", "archived"];
  return `${pageHeader("Project administration", `${project.name} settings`, "Edit safe project metadata. Membership and destructive changes remain authoritative server actions.")}
    <section class="dashboard-grid">
      <article class="card form-card"><form id="project-settings-form" data-project-id="${project.id}">
        <div class="field"><label for="settings-name">Project name</label><input id="settings-name" name="name" value="${escapeHtml(project.name)}" required></div>
        <div class="field"><label for="settings-status">Lifecycle status</label>
          <select id="settings-status" name="lifecycleStatus">
            ${statuses.map((s) => `<option value="${s}" ${project.lifecycleStatus === s ? "selected" : ""}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join("")}
          </select>
        </div>
        <div class="field"><label for="settings-description">Description</label><textarea id="settings-description" name="description">${escapeHtml(project.description)}</textarea></div>
        <div class="form-actions"><button class="button primary" type="submit">Save changes</button></div>
      </form></article>
      <article class="card"><div class="card-head"><h2>Danger zone</h2></div><div class="card-body"><p class="page-copy">Archive this project to mark it inactive in the workspace. Archived projects can be reactivated at any time.</p><button class="button danger" data-action="archive-project" data-project-id="${project.id}">${project.lifecycleStatus === "archived" ? "Unarchive project" : "Archive project"}</button></div></article>
    </section>`;
}
