// @ts-check
import { escapeHtml, notFound } from "../../shared/components/ui.js";
import { state } from "../../shared/state/store.js";
import { provenanceBadge } from "../components/provenanceBadge.js";

/**
 * Strategy view: Strategic intent, guiding principles, known risks & alignment.
 * @returns {string}
 */
export function strategyView() {
  const strat = state.productStrategy;
  if (!strat) {
    return notFound("Product Strategy Unavailable", "No active strategic aggregate has been initialized for this project.");
  }

  const reqs = state.requirements || [];
  const feats = state.productFeatures || [];

  return `
    <div class="product-section-layout">
      <!-- Toolbar -->
      <div class="product-toolbar">
        <div>
          <h2 style="font-size: 16px; margin: 0 0 4px;">Strategic Intent & Product Tenets</h2>
          <p class="small subtle" style="margin: 0;">
            The foundational anchor governing feature qualification, architecture trade-offs, and requirement validity.
          </p>
        </div>

        <div class="product-toolbar-right">
          <button class="button" data-action="product-modal" data-modal="edit_strategy">
            <span>✎</span> Edit Strategy
          </button>
        </div>
      </div>

      <!-- Core Objective Banner -->
      <article class="card product-card product-strategy-hero">
        <div class="card-head">
          <div>
            <div class="eyebrow" style="font-size: 10px;">Primary Mission</div>
            <h2 style="margin: 4px 0 0;">Core Strategic Objective</h2>
          </div>
          ${provenanceBadge(strat)}
        </div>
        <div class="card-body">
          <blockquote class="product-strategy-quote">
            "${escapeHtml(strat.objective)}"
          </blockquote>
          <div class="product-strategy-meta">
            <span class="subtle small">Last updated: ${escapeHtml(strat.updatedAt ? new Date(strat.updatedAt).toLocaleDateString() : "Active")}</span>
            <span class="subtle small">Scope: Enterprise Core Platform</span>
          </div>
        </div>
      </article>

      <!-- 2-Column Bento: Principles and Risks -->
      <div class="product-bento-layout">
        <!-- Left: Guiding Principles -->
        <div class="product-bento-col">
          <article class="card product-card">
            <div class="card-head">
              <div>
                <div class="eyebrow" style="font-size: 10px;">Architecture & Product Tenets</div>
                <h2>Guiding Principles (${strat.principles?.length || 0})</h2>
              </div>
            </div>
            <div class="card-body">
              <div class="product-principles-list">
                ${(strat.principles || []).map((principle, idx) => {
                  const parts = principle.split(":");
                  const title = parts.length > 1 ? parts[0] : `Principle ${idx + 1}`;
                  const desc = parts.length > 1 ? parts.slice(1).join(":") : principle;

                  return `
                    <div class="product-principle-item">
                      <div class="principle-number">0${idx + 1}</div>
                      <div class="principle-content">
                        <strong>${escapeHtml(title.trim())}</strong>
                        <p class="small subtle" style="margin-top: 4px; line-height: 1.5;">
                          ${escapeHtml(desc.trim())}
                        </p>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          </article>
        </div>

        <!-- Right: Known Risks & Alignment Signals -->
        <div class="product-bento-col">
          <article class="card product-card">
            <div class="card-head">
              <div>
                <div class="eyebrow" style="font-size: 10px;">Governance & Mitigations</div>
                <h2>Known Risks & Constraints (${strat.risks?.length || 0})</h2>
              </div>
            </div>
            <div class="card-body">
              <div class="product-risks-list">
                ${(strat.risks || []).map((risk, idx) => `
                  <div class="product-risk-item">
                    <span class="risk-badge">RISK-0${idx + 1}</span>
                    <div class="risk-content">
                      <p style="margin: 0; font-size: 13px; line-height: 1.5;">${escapeHtml(risk)}</p>
                      <div class="risk-tags" style="margin-top: 8px;">
                        <span class="product-tag danger">Grounded Constraint</span>
                        <span class="product-tag">Monitored</span>
                      </div>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </article>

          <!-- Strategy Alignment Summary -->
          <article class="card product-card">
            <div class="card-head">
              <h2>Operational Alignment</h2>
            </div>
            <div class="card-body">
              <div class="product-alignment-stats">
                <div class="alignment-stat">
                  <div class="small subtle">Requirement Coverage</div>
                  <div class="product-rank-num" style="font-size: 22px;">${reqs.length} Active</div>
                  <span class="small subtle">100% mapped to strategic tenets</span>
                </div>
                <div class="alignment-stat">
                  <div class="small subtle">Feature Roadmap Weight</div>
                  <div class="product-rank-num" style="font-size: 22px;">${feats.length} Features</div>
                  <span class="small subtle">Ranked against core objective</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  `;
}
