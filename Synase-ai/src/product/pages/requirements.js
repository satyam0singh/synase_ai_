import { escapeHtml, status } from "../../shared/components/ui.js";
import { state } from "../../shared/state/store.js";
import { provenanceBadge } from "../components/provenanceBadge.js";
import { lucideIcon } from "../../shared/components/icons.js";

/**
 * Requirements inventory with search, filters, inline detail inspection and lifecycle controls.
 * @returns {string}
 */
export function requirementsView() {
  const reqs = state.requirements || [];
  const search = (state.productSearchQuery || "").toLowerCase();
  const filterStatus = state.productFilterStatus || "all";
  const filterPriority = state.productFilterPriority || "all";
  const filterProvenance = state.productFilterProvenance || "all";

  const filtered = reqs.filter((item) => {
    const matchesSearch =
      !search ||
      item.id.toLowerCase().includes(search) ||
      item.title.toLowerCase().includes(search) ||
      (item.rationale || "").toLowerCase().includes(search) ||
      (item.evidence || []).some((e) => e.toLowerCase().includes(search));

    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesPriority = filterPriority === "all" || item.priority === filterPriority;
    const matchesProvenance = filterProvenance === "all" || item.provenance === filterProvenance;

    return matchesSearch && matchesStatus && matchesPriority && matchesProvenance;
  });

  const selectedReq = state.productSelectedRequirementId
    ? reqs.find((r) => r.id === state.productSelectedRequirementId)
    : null;

  return `
    <div class="product-section-layout">
      <!-- Toolbar: Search, Filters, and New Requirement button -->
      <div class="product-toolbar">
        <div class="product-toolbar-left">
          <input
            type="search"
            class="field-inline search"
            id="product-search-input"
            placeholder="Search requirements by ID, title, or evidence..."
            value="${escapeHtml(state.productSearchQuery || "")}"
          />

          <select class="field-inline" id="product-status-filter" aria-label="Filter by Status">
            <option value="all" ${filterStatus === "all" ? "selected" : ""}>All Statuses</option>
            <option value="identified" ${filterStatus === "identified" ? "selected" : ""}>Identified</option>
            <option value="clarified" ${filterStatus === "clarified" ? "selected" : ""}>Clarified</option>
            <option value="approved" ${filterStatus === "approved" ? "selected" : ""}>Approved</option>
            <option value="in_progress" ${filterStatus === "in_progress" ? "selected" : ""}>In Progress</option>
            <option value="implemented" ${filterStatus === "implemented" ? "selected" : ""}>Implemented</option>
            <option value="validated" ${filterStatus === "validated" ? "selected" : ""}>Validated</option>
          </select>

          <select class="field-inline" id="product-priority-filter" aria-label="Filter by Priority">
            <option value="all" ${filterPriority === "all" ? "selected" : ""}>All Priorities</option>
            <option value="critical" ${filterPriority === "critical" ? "selected" : ""}>Critical</option>
            <option value="high" ${filterPriority === "high" ? "selected" : ""}>High</option>
            <option value="medium" ${filterPriority === "medium" ? "selected" : ""}>Medium</option>
            <option value="low" ${filterPriority === "low" ? "selected" : ""}>Low</option>
          </select>

          <select class="field-inline" id="product-provenance-filter" aria-label="Filter by Provenance">
            <option value="all" ${filterProvenance === "all" ? "selected" : ""}>All Provenance</option>
            <option value="confirmed" ${filterProvenance === "confirmed" ? "selected" : ""}>Confirmed</option>
            <option value="ai_suggested" ${filterProvenance === "ai_suggested" ? "selected" : ""}>AI Suggested</option>
          </select>
        </div>

        <div class="product-toolbar-right">
          <span class="small subtle">${filtered.length} of ${reqs.length} requirements</span>
          <button class="button" data-action="product-modal" data-modal="import_requirements">
            <span>${lucideIcon('download', { size: 14 })}</span> Import
          </button>
          <button class="button primary" data-action="product-modal" data-modal="new_requirement">
            <span>${lucideIcon('plus', { size: 14 })}</span> Add Requirement
          </button>
        </div>
      </div>

      <!-- Main Layout: Table + Optional Detail Drawer -->
      <div class="product-split-layout ${selectedReq ? "has-drawer" : ""}">
        <div class="product-main-view">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style="width: 110px;">ID</th>
                  <th>Title & Rationale</th>
                  <th style="width: 100px;">Type</th>
                  <th style="width: 100px;">Priority</th>
                  <th style="width: 110px;">Status</th>
                  <th>Evidence & Arch Impact</th>
                  <th style="width: 130px;">Provenance</th>
                  <th style="width: 90px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0
                  ? `<tr><td colspan="8" style="text-align: center; padding: 48px;"><p class="muted">No requirements match the selected criteria.</p></td></tr>`
                  : filtered
                      .map(
                        (item) => `
                    <tr class="${state.productSelectedRequirementId === item.id ? "row-selected" : ""}">
                      <td><code class="product-id-tag">${escapeHtml(item.id)}</code></td>
                      <td>
                        <strong>${escapeHtml(item.title)}</strong>
                        <br>
                        <span class="small subtle">${escapeHtml(item.rationale || "—")}</span>
                      </td>
                      <td><span class="product-type-badge">${escapeHtml(item.type)}</span></td>
                      <td>${status(item.priority)}</td>
                      <td>${status(item.status)}</td>
                      <td>
                        <span class="small"><b>Evidence:</b> ${escapeHtml((item.evidence || []).join(", ") || "—")}</span>
                        <br>
                        <span class="small subtle"><b>Impact:</b> ${escapeHtml(item.architectureImpact || "—")}</span>
                      </td>
                      <td>${provenanceBadge(item)}</td>
                      <td style="text-align: right;">
                        <button
                          class="button ghost small"
                          data-action="product-select-requirement"
                          data-req-id="${escapeHtml(item.id)}"
                        >
                          ${state.productSelectedRequirementId === item.id ? "Close" : "Inspect"}
                        </button>
                      </td>
                    </tr>
                  `
                      )
                      .join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Detail Drawer / Inspector -->
        ${
          selectedReq
            ? `
          <aside class="product-drawer">
            <div class="drawer-head">
              <div>
                <span class="eyebrow" style="font-size: 10px;">Requirement Detail</span>
                <h3>${escapeHtml(selectedReq.id)}</h3>
              </div>
              <button class="icon-btn" data-action="product-select-requirement" data-req-id="${escapeHtml(selectedReq.id)}" aria-label="Close inspector">${lucideIcon('x', { size: 16 })}</button>
            </div>

            <div class="drawer-body">
              <h2 style="font-size: 18px; margin-bottom: 12px;">${escapeHtml(selectedReq.title)}</h2>

              <div class="drawer-badges">
                ${provenanceBadge(selectedReq)}
                <span class="product-type-badge">${escapeHtml(selectedReq.type)}</span>
                ${status(selectedReq.priority)}
                ${status(selectedReq.status)}
              </div>

              <div class="drawer-section">
                <h4>Decision Rationale</h4>
                <p class="small">${escapeHtml(selectedReq.rationale || "No rationale provided.")}</p>
              </div>

              <div class="drawer-section">
                <h4>Supporting Evidence</h4>
                <ul class="clean-list">
                  ${(selectedReq.evidence || []).map((e) => `<li><span class="small">📄 ${escapeHtml(e)}</span></li>`).join("")}
                </ul>
              </div>

              <div class="drawer-section">
                <h4>Architecture Impact</h4>
                <p class="small subtle">${escapeHtml(selectedReq.architectureImpact || "No direct impact mapped.")}</p>
              </div>

              <div class="drawer-section">
                <h4>Update Status</h4>
                <div class="drawer-status-actions">
                  <button class="button small" data-action="product-update-req-status" data-req-id="${escapeHtml(selectedReq.id)}" data-status="approved">
                    Mark Approved
                  </button>
                  <button class="button small" data-action="product-update-req-status" data-req-id="${escapeHtml(selectedReq.id)}" data-status="in_progress">
                    Mark In Progress
                  </button>
                  <button class="button small" data-action="product-update-req-status" data-req-id="${escapeHtml(selectedReq.id)}" data-status="implemented">
                    Mark Implemented
                  </button>
                  <button class="button danger small" data-action="product-delete-req" data-req-id="${escapeHtml(selectedReq.id)}">
                    Archive Requirement
                  </button>
                </div>
              </div>
            </div>
          </aside>
        `
            : ""
        }
      </div>
    </div>
  `;
}
