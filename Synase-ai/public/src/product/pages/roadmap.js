import { escapeHtml, status } from "../../shared/components/ui.js";
import { state } from "../../shared/state/store.js";
import { provenanceBadge } from "../components/provenanceBadge.js";
import { lucideIcon } from "../../shared/components/icons.js";

/**
 * Roadmap view: Delivery sequence, releases, dependencies and milestones.
 * @returns {string}
 */
export function roadmapView() {
  const items = (state.roadmapItems || []).slice().sort((a, b) => a.sequence - b.sequence);
  const total = items.length;
  const completed = items.filter((i) => i.status === "completed").length;
  const active = items.find((i) => i.status === "active");

  return `
    <div class="product-section-layout">
      <!-- Toolbar -->
      <div class="product-toolbar">
        <div>
          <h2 style="font-size: 16px; margin: 0 0 4px;">Milestone Delivery Roadmap</h2>
          <p class="small subtle" style="margin: 0;">
            Sequenced delivery path with topological dependency validation and linked candidate features.
          </p>
        </div>

        <div class="product-toolbar-right">
          <button class="button primary" data-action="product-modal" data-modal="new_roadmap">
            <span>${lucideIcon('plus', { size: 14 })}</span> Add Milestone
          </button>
        </div>
      </div>

      <!-- Roadmap Progress Bar -->
      <div class="card product-card" style="margin-bottom: 20px;">
        <div class="card-body" style="padding: 16px 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="small" style="font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
              Delivery Progress: ${completed} of ${total} Milestones Complete (${total ? Math.round((completed / total) * 100) : 0}%)
            </span>
            <span class="small subtle">
              Current Active: <strong>${escapeHtml(active?.milestone || "None")}</strong>
            </span>
          </div>
          <div class="product-score-bar-track" style="height: 6px;">
            <div class="product-score-bar-fill value" style="width: ${total ? Math.round((completed / total) * 100) : 0}%;"></div>
          </div>
        </div>
      </div>

      <!-- Milestone Timeline List -->
      <div class="product-roadmap-timeline">
        ${items.map((item, idx) => {
          const isCompleted = item.status === "completed";
          const isActive = item.status === "active";
          const isDelayed = item.status === "delayed";

          return `
            <article class="card product-roadmap-card ${isActive ? "active-milestone" : ""}">
              <div class="product-road-col-seq">
                <div class="roadmap-seq-badge">${item.sequence}</div>
                <div class="roadmap-seq-line"></div>
              </div>

              <div class="product-road-col-content">
                <div class="product-road-header">
                  <div class="product-road-title-wrap">
                    <span class="product-release-tag">${escapeHtml(item.release)}</span>
                    <h3 class="product-road-title">${escapeHtml(item.milestone)}</h3>
                    ${provenanceBadge(item)}
                  </div>
                  <div class="product-road-status-wrap">
                    ${status(item.status)}
                    <select
                      class="field-inline small"
                      style="margin-left: 8px;"
                      data-action="product-update-roadmap-status"
                      data-roadmap-id="${escapeHtml(item.id)}"
                      aria-label="Update milestone status"
                    >
                      <option value="planned" ${item.status === "planned" ? "selected" : ""}>Planned</option>
                      <option value="active" ${item.status === "active" ? "selected" : ""}>Active</option>
                      <option value="completed" ${item.status === "completed" ? "selected" : ""}>Completed</option>
                      <option value="delayed" ${item.status === "delayed" ? "selected" : ""}>Delayed</option>
                    </select>
                  </div>
                </div>

                <div class="product-road-dates">
                  <span class="small subtle">Target Schedule:</span>
                  <span class="product-date-range">
                    ${escapeHtml(item.startDate || "TBD")} ${lucideIcon('arrow-right', { size: 12 })} ${escapeHtml(item.endDate || "TBD")}
                  </span>
                </div>

                <div class="product-road-links">
                  ${item.dependencies?.length ? `
                    <div class="road-link-group">
                      <span class="small subtle">Dependencies:</span>
                      ${item.dependencies.map((dep) => `<span class="product-tag danger">${escapeHtml(dep)}</span>`).join(" ")}
                    </div>
                  ` : `
                    <div class="road-link-group">
                      <span class="small subtle">Dependencies: None (Genesis Milestone)</span>
                    </div>
                  `}

                  ${item.features?.length ? `
                    <div class="road-link-group">
                      <span class="small subtle">Features:</span>
                      ${item.features.map((f) => `<span class="product-tag">${escapeHtml(f)}</span>`).join(" ")}
                    </div>
                  ` : ""}

                  ${item.requirements?.length ? `
                    <div class="road-link-group">
                      <span class="small subtle">Requirements:</span>
                      ${item.requirements.map((r) => `<span class="product-tag">${escapeHtml(r)}</span>`).join(" ")}
                    </div>
                  ` : ""}
                </div>

                <div class="product-road-footer">
                  <span class="small subtle">Milestone ID: ${escapeHtml(item.id)}</span>
                  <button
                    class="button ghost small danger"
                    data-action="product-delete-roadmap"
                    data-roadmap-id="${escapeHtml(item.id)}"
                  >
                    Delete Milestone
                  </button>
                </div>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </div>
  `;
}
