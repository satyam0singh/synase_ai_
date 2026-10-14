// @ts-check
/* Repository connection, snapshots and tree preview. */
import { state } from "../../../shared/state/store.js";
import { routes } from "../../../app/paths.js";
import {
  pageHeader,
  status,
  notFound,
  escapeHtml
} from "../../../shared/components/ui.js";
import { formatBytes } from "../../../shared/utils/format.js";
import { lucideIcon } from "../../../shared/components/icons.js";
export function repositoryPage(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return notFound("Project not found", "Repository context cannot be loaded for an unavailable project.");
  state.projectId = project.id;
  const detail = state.repositories.find((item) => item.id === state.repositoryDetailId);
  return `${pageHeader("Project context", "Repository", `Connect and inspect repositories for ${project.name}. Sync actions are explicit mock operations.`, `<button class="button primary" data-action="toggle-repo-form">${lucideIcon('plus', { size: 14 })} Connect repository</button>`)}
    <div class="alert">Mock adapter active. Provider authorization, source retrieval, scanning, and synchronization are not live.</div>
    <section id="repo-form-panel" class="card form-card hidden-panel">
      <form id="connect-repository-form">
        <div class="form-grid">
          <div class="field"><label for="repo-provider">Provider</label><select id="repo-provider" name="provider" required><option value="github">GitHub</option><option value="gitlab">GitLab</option><option value="bitbucket">Bitbucket</option><option value="local">Local</option></select></div>
          <div class="field"><label for="repo-branch">Default branch</label><input id="repo-branch" name="defaultBranch" value="main"></div>
          <div class="field full"><label for="repo-path">Repository path</label><input id="repo-path" name="fullName" placeholder="organization/repository" required><small>Do not enter provider tokens or credentials.</small></div>
        </div>
        <div id="repo-form-message"></div>
        <div class="form-actions">
          <button type="button" class="button ghost" data-action="toggle-repo-form">Cancel</button>
          <button class="button primary" type="submit">Connect mock repository</button>
        </div>
      </form>
    </section>
    ${state.repositories.length ? `<div class="table-wrap"><table><thead><tr><th>Repository</th><th>Provider</th><th>Branch</th><th>Connection</th><th>Last sync</th><th></th></tr></thead><tbody>
      ${state.repositories.map((repository) => `<tr>
        <td><strong>${escapeHtml(repository.fullName)}</strong><br><span class="small">${escapeHtml(repository.visibility)}</span></td>
        <td>${escapeHtml(repository.provider)}</td><td><code>${escapeHtml(repository.defaultBranch)}</code></td><td>${status(repository.connectionStatus)}</td>
        <td>${repository.lastSyncedAt ? new Date(repository.lastSyncedAt).toLocaleString() : "Never"}</td>
        <td><div class="cluster"><button class="button ghost" data-action="repo-detail" data-repository-id="${repository.id}">Inspect</button><button class="button" data-action="repo-sync" data-repository-id="${repository.id}" ${repository.connectionStatus !== "connected" ? "disabled" : ""}>Sync</button></div></td>
      </tr>`).join("")}</tbody></table></div>` : `<section class="card empty"><div><div class="empty-icon">${lucideIcon('git-branch', { size: 28 })}</div><h2>No repositories connected</h2><p>Connect a repository to provide project source context. Provider credentials are never collected by this mock.</p><button class="button primary" data-action="toggle-repo-form">${lucideIcon('plus', { size: 14 })} Connect repository</button></div></section>`}
    ${detail ? `<section class="card repository-detail">
      <div class="card-head"><div><h2>${escapeHtml(detail.fullName)}</h2><span class="small subtle">Snapshot and tree preview</span></div><button class="icon-btn" data-action="close-repo-detail" aria-label="Close repository detail">${lucideIcon('x', { size: 16 })}</button></div>
      <div class="detail-grid">
        <div class="card-body"><h3>Snapshots</h3>${state.repositorySnapshots.length ? `<div class="snapshot-list">${state.repositorySnapshots.map((snapshot) => `<div class="snapshot"><code>${escapeHtml(snapshot.commitSha)}</code><span>${escapeHtml(snapshot.branch)} · ${snapshot.fileCount} files · ${formatBytes(snapshot.totalBytes)}</span>${status(snapshot.scanStatus)}</div>`).join("")}</div>` : `<p class="page-copy">No snapshots are available.</p>`}</div>
        <div class="card-body tree-panel"><h3>Lazy tree preview</h3>${state.repositoryTree.length ? `<ul class="tree-list">${state.repositoryTree.map((node) => `<li><span aria-hidden="true">${node.type === "directory" ? lucideIcon('chevron-down', { size: 12 }) : "·"}</span><code>${escapeHtml(node.path)}</code>${node.byteSize ? `<small>${formatBytes(node.byteSize)}</small>` : ""}</li>`).join("")}</ul>` : `<p class="page-copy">Tree data is unavailable.</p>`}</div>
      </div>
    </section>` : ""}`;
}
