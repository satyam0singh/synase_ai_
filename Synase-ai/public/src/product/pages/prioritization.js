import { escapeHtml, status } from "../../shared/components/ui.js";
import { state } from "../../shared/state/store.js";
import { provenanceBadge } from "../components/provenanceBadge.js";
import { lucideIcon } from "../../shared/components/icons.js";

/**
 * Feature prioritization board and score calibration.
 * @returns {string}
 */
export function prioritizationView() {
  const feats = state.productFeatures || [];

  return `
    <div class="product-section-layout">
      <!-- Section Header Info & Actions -->
      <div class="product-toolbar">
        <div>
          <h2 style="font-size: 16px; margin: 0 0 4px;">Candidate Feature Prioritization</h2>
          <p class="small subtle" style="margin: 0;">
            Features ranked by multi-criteria assessment: Business Value, Customer Impact, Implementation Effort, and Architectural Risk.
          </p>
        </div>

        <div class="product-toolbar-right">
          <button class="button" data-action="product-modal" data-modal="new_feature">
            <span>${lucideIcon('plus', { size: 14 })}</span> Add Feature
          </button>
          <button class="button primary" data-action="product-reprioritize-auto">
            <span>${lucideIcon('zap', { size: 14 })}</span> Auto-Rank by Value/Effort
          </button>
        </div>
      </div>

      <!-- Feature Grid -->
      <div class="product-priority-grid">
        ${feats
          .sort((a, b) => a.priorityRank - b.priorityRank)
          .map((feature, idx) => `
            <article class="card product-feature-card">
              <div class="card-head product-feature-head">
                <div class="product-rank-wrap">
                  <span class="product-rank-badge">#${feature.priorityRank}</span>
                  ${provenanceBadge(feature)}
                </div>
                <div class="product-rank-controls">
                  <button
                    class="icon-btn small"
                    title="Move Rank Up"
                    data-action="product-move-rank"
                    data-feat-id="${escapeHtml(feature.id)}"
                    data-dir="up"
                    ${idx === 0 ? "disabled" : ""}
                  >${lucideIcon('chevron-up', { size: 12 })}</button>
                  <button
                    class="icon-btn small"
                    title="Move Rank Down"
                    data-action="product-move-rank"
                    data-feat-id="${escapeHtml(feature.id)}"
                    data-dir="down"
                    ${idx === feats.length - 1 ? "disabled" : ""}
                  >${lucideIcon('chevron-down', { size: 12 })}</button>
                  <button
                    class="icon-btn small"
                    title="Delete Candidate Feature"
                    data-action="product-feature-delete"
                    data-feat-id="${escapeHtml(feature.id)}"
                    style="color: var(--danger, #ef4444); margin-left: 4px;"
                  >${lucideIcon('trash-2', { size: 13 })}</button>
                </div>
              </div>

              <div class="card-body">
                <div class="product-feature-title-row">
                  <code class="product-id-tag">${escapeHtml(feature.id)}</code>
                  <h3 class="product-feature-title">${escapeHtml(feature.title)}</h3>
                </div>

                <p class="product-feature-rationale">${escapeHtml(feature.rationale)}</p>

                <!-- 4-Dimension Metric Bars -->
                <div class="product-score-matrix">
                  <div class="score-row">
                    <span class="score-label">Value</span>
                    <div class="score-bar-bg">
                      <div class="score-bar-fill value" style="width: ${feature.businessValue * 10}%"></div>
                    </div>
                    <b class="score-val">${feature.businessValue}/10</b>
                  </div>

                  <div class="score-row">
                    <span class="score-label">Impact</span>
                    <div class="score-bar-bg">
                      <div class="score-bar-fill impact" style="width: ${feature.impact * 10}%"></div>
                    </div>
                    <b class="score-val">${feature.impact}/10</b>
                  </div>

                  <div class="score-row">
                    <span class="score-label">Effort</span>
                    <div class="score-bar-bg">
                      <div class="score-bar-fill effort" style="width: ${feature.effort * 10}%"></div>
                    </div>
                    <b class="score-val">${feature.effort}/10</b>
                  </div>

                  <div class="score-row">
                    <span class="score-label">Risk</span>
                    <div class="score-bar-bg">
                      <div class="score-bar-fill risk" style="width: ${feature.risk * 10}%"></div>
                    </div>
                    <b class="score-val">${feature.risk}/10</b>
                  </div>
                </div>

                <div class="product-feature-footer">
                  <div class="cluster">${status(feature.status)}</div>
                  <span class="small subtle">
                    Score: <b>${Math.round(((feature.businessValue + feature.impact) / (feature.effort + feature.risk || 1)) * 10) / 10}</b>
                  </span>
                </div>
              </div>
            </article>
          `)
          .join("")}
      </div>
    </div>
  `;
}
