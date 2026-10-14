// @ts-check
/* Multimodal input composer and inventory. */
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
export function assetState(asset) {
  const blocked = asset.securityScanStatus === "blocked";
  return `<div class="state-stack">${status(asset.processingStatus)}${status(asset.securityScanStatus)}${blocked ? `<span class="small danger-text">Security blocked</span>` : ""}</div>`;
}

export function assetTable(assets, projectId) {
  if (!assets.length) return `<section class="card empty"><div><div class="empty-icon">${lucideIcon('file-up', { size: 28 })}</div><h2>No inputs yet</h2><p>Add a file, text block, URL, or connected repository.</p></div></section>`;
  return `<div class="table-wrap"><table><thead><tr><th>Input</th><th>Type/source</th><th>Size</th><th>Processing / security</th><th>Extraction</th><th></th></tr></thead><tbody>
    ${assets.map((asset) => `<tr>
      <td><strong>${escapeHtml(asset.name)}</strong><br><span class="small">${new Date(asset.createdAt).toLocaleString()}</span></td>
      <td>${escapeHtml(asset.inputType)}<br><span class="small">${escapeHtml(asset.sourceType)}</span></td><td>${formatBytes(asset.byteSize)}</td>
      <td>${assetState(asset)}</td><td>${status(asset.extractionStatus)}</td>
      <td><div class="cluster">${["received","scanning","extracting","indexing"].includes(asset.processingStatus) ? `<button class="button" data-action="advance-asset" data-asset-id="${asset.id}" title="User-triggered mock transition">Advance demo</button>` : ""}<button class="button ghost" data-action="delete-asset" data-asset-id="${asset.id}">Remove</button></div></td>
    </tr>`).join("")}</tbody></table></div>`;
}

function getFileIcon(name = "") {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "svg", "webp", "gif"].includes(ext)) return lucideIcon('image', { size: 20 });
  if (["pdf"].includes(ext)) return lucideIcon('file-text', { size: 20 });
  if (["csv", "xlsx", "xls"].includes(ext)) return lucideIcon('bar-chart-3', { size: 20 });
  if (["doc", "docx", "txt", "md"].includes(ext)) return lucideIcon('file-text', { size: 20 });
  if (["zip", "tar", "gz", "rar"].includes(ext)) return lucideIcon('boxes', { size: 20 });
  if (["mp3", "wav", "m4a"].includes(ext)) return lucideIcon('mic', { size: 20 });
  if (["mp4", "mov", "webm"].includes(ext)) return lucideIcon('play', { size: 20 });
  return lucideIcon('file-text', { size: 20 });
}

export function inputComposer(projectId) {
  const tabs = [
    ["file", "File upload"],
    ["text", "Text"],
    ["url", "URL"],
    ["repository", "Repository"]
  ];
  const file = state.selectedFile;
  const isImage = file?.type?.startsWith("image/") && file?.previewUrl;

  return `<section class="card composer">
    <div class="input-tabs" role="tablist">${tabs.map(([key, label]) => `<button class="input-tab ${state.inputTab === key ? "active" : ""}" role="tab" aria-selected="${state.inputTab === key}" data-action="input-tab" data-tab="${key}">${label}</button>`).join("")}</div>
    <div class="card-body">
      ${state.inputTab === "file" ? `<form id="file-input-form">
        ${
          file
            ? `<div class="file-preview-card">
                 ${isImage ? `<img class="file-preview-thumb" src="${escapeHtml(file.previewUrl)}" alt="Preview" />` : `<div class="file-preview-icon">${getFileIcon(file.name)}</div>`}
                 <div class="file-preview-meta">
                   <span class="file-preview-name">${escapeHtml(file.name)}</span>
                   <span class="file-preview-size">${formatBytes(file.size)} · ${escapeHtml(file.type || "file")}</span>
                   ${file.error ? `<span class="small danger-text">${escapeHtml(file.error)}</span>` : `<span class="small subtle ok-text">Ready for mock upload sequence</span>`}
                 </div>
                 <button type="button" class="button ghost small" data-action="remove-selected-file">${lucideIcon('x', { size: 14 })} Remove</button>
               </div>`
            : `<label class="dropzone" id="asset-dropzone" for="asset-file">
                 <span class="drop-icon">${lucideIcon('upload-cloud', { size: 28 })}</span>
                 <strong>Select or drag &amp; drop a multimodal file</strong>
                 <span>PDF, DOCX, PPTX, CSV, spreadsheets, images, audio, video, logs, or code archives · limit 50 MB</span>
                 <input id="asset-file" name="file" type="file">
               </label>`
        }
        <div class="option-row"><label><input type="checkbox" name="ocr"> OCR when applicable</label><label><input type="checkbox" name="extractTables"> Extract tables</label><label><input type="checkbox" name="profileData"> Profile structured data</label></div>
        <div id="input-form-message"></div>
        <div class="form-actions"><button class="button primary" type="submit" ${file?.error ? "disabled" : ""}>Run mock upload sequence</button></div>
      </form>` : ""}
      ${state.inputTab === "text" ? `<form id="text-input-form"><div class="field"><label for="text-title">Title</label><input id="text-title" name="title" placeholder="Context note"></div><div class="field"><label for="text-content">Text context</label><textarea id="text-content" name="text" required placeholder="Paste trusted project context"></textarea></div><div id="input-form-message"></div><div class="form-actions"><button class="button primary" type="submit">Add text context</button></div></form>` : ""}
      ${state.inputTab === "url" ? `<form id="url-input-form"><div class="field"><label for="source-url">URL</label><input id="source-url" name="url" type="url" required placeholder="https://example.com/spec"><small>External content is treated as untrusted until processed.</small></div><div id="input-form-message"></div><div class="form-actions"><button class="button primary" type="submit">Add URL</button></div></form>` : ""}
      ${state.inputTab === "repository" ? `<div class="empty compact-empty"><div><div class="empty-icon">⌘</div><h2>Use connected repositories</h2><p>Repository-based inputs use the project repository inventory. No provider credentials are exposed here.</p><button class="button" data-route="/app/projects/${projectId}/repository">Open repositories</button></div></div>` : ""}
    </div>
  </section>`;
}

export function inputsPage(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return notFound("Project not found", "Inputs cannot be loaded for an unavailable project.");
  state.projectId = project.id;

  const searchQuery = (state.assetSearchQuery || "").toLowerCase();
  const statusFilter = state.assetStatusFilter || "";
  const filtered = state.assets.filter((asset) => {
    const matchesSearch = !searchQuery || asset.name.toLowerCase().includes(searchQuery) || (asset.inputType || "").toLowerCase().includes(searchQuery);
    const matchesStatus = !statusFilter || asset.processingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return `${pageHeader("Project context", "Multimodal inputs", `Add and track trusted project context for ${project.name}. The route and all processing are explicitly provisional/mock.`, "")}
    <div class="alert">Provisional route · Mock adapter active. Selected file contents never leave this browser build; only metadata is added to fixtures.</div>
    ${inputComposer(projectId)}
    <section class="asset-section">
      <div class="section-title">
        <div><h2>Input inventory</h2><p class="small subtle">${filtered.length} of ${state.assets.length} items</p></div>
        <div class="filter-cluster" style="display:flex;gap:8px;align-items:center;">
          <input type="search" id="asset-search-input" placeholder="Search inputs..." class="field-inline" style="padding:6px 10px;font-size:12.5px;" value="${escapeHtml(state.assetSearchQuery || "")}" />
          <select id="asset-status-filter" class="field-inline" aria-label="Filter processing status">
            <option value="">All processing states</option>
            <option ${statusFilter === "received" ? "selected" : ""}>received</option>
            <option ${statusFilter === "scanning" ? "selected" : ""}>scanning</option>
            <option ${statusFilter === "extracting" ? "selected" : ""}>extracting</option>
            <option ${statusFilter === "indexing" ? "selected" : ""}>indexing</option>
            <option ${statusFilter === "ready" ? "selected" : ""}>ready</option>
            <option ${statusFilter === "warning" ? "selected" : ""}>warning</option>
            <option ${statusFilter === "failed" ? "selected" : ""}>failed</option>
          </select>
        </div>
      </div>
      <div id="asset-results">${assetTable(filtered, projectId)}</div>
    </section>`;
}
