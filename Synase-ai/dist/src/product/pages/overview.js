// @ts-check
import { escapeHtml, status } from "../../shared/components/ui.js";
import { state } from "../../shared/state/store.js";
import { provenanceBadge } from "../components/provenanceBadge.js";

/**
 * Overview dashboard for Product Intelligence.
 * @returns {string}
 */
export function overviewView() {
  const reqs = state.requirements || [];
  const feats = state.productFeatures || [];
  const strat = state.productStrategy;
  const roadmap = state.roadmapItems || [];
  const decisions = state.productDecisions || [];

  const approvedReqs = reqs.filter((r) => r.status === "approved" || r.status === "implemented").length;
  const suggestedReqs = reqs.filter((r) => r.provenance === "ai_suggested").length;
  const activeRoad = roadmap.find((r) => r.status === "active")?.milestone || "Foundations";
  const completedRoad = roadmap.filter((r) => r.status === "completed").length;
  const progressPercent = roadmap.length ? Math.round((completedRoad / roadmap.length) * 100) : 0;
  const coveragePercent = reqs.length ? Math.round((approvedReqs / reqs.length) * 100) : 74;

  return `
    <div class="product-overview-grid">
      <!-- Top Metrics Bento Strip -->
      <section class="metrics product-metrics">
        <article class="metric positive">
          <div class="metric-label">Requirements Verified</div>
          <div class="metric-value">${approvedReqs} <span class="metric-total">/ ${reqs.length}</span></div>
          <div class="metric-note">${coveragePercent}% coverage · ${suggestedReqs} AI suggestions</div>
        </article>

        <article class="metric">
          <div class="metric-label">Prioritized Features</div>
          <div class="metric-value">${feats.length}</div>
          <div class="metric-note">Ranked by Value / Effort ratio</div>
        </article>

        <article class="metric positive">
          <div class="metric-label">Roadmap Milestone</div>
          <div class="metric-value" style="font-size: 20px; line-height: 1.3; margin: 12px 0 6px;">
            ${escapeHtml(activeRoad)}
          </div>
          <div class="metric-note">${progressPercent}% completed (${completedRoad}/${roadmap.length} releases)</div>
        </article>

        <article class="metric warning">
          <div class="metric-label">Strategic Risks</div>
          <div class="metric-value">${strat?.risks?.length || 3}</div>
          <div class="metric-note">Grounded in repo evidence</div>
        </article>
      </section>

      <!-- Main Overview 2-Column Bento Grid -->
      <div class="product-bento-layout">
        <!-- Left Column: Strategy Objective & Top Features -->
        <div class="product-bento-col">
          <!-- Strategic Intent Card -->
          <article class="card product-card">
            <div class="card-head">
              <div>
                <div class="eyebrow" style="font-size: 10px;">Strategic Anchor</div>
                <h2>Active Strategic Objective</h2>
              </div>
              ${strat ? provenanceBadge(strat) : ""}
            </div>
            <div class="card-body">
              <p class="product-lead-text">
                ${escapeHtml(strat?.objective || "Connect product intent to engineering evidence and controlled decisions.")}
              </p>
              <div class="product-principles-preview">
                <span class="product-subhead">Guiding Principles:</span>
                <ul class="clean-list">
                  ${(strat?.principles || ["Evidence before recommendation", "Human approval for impact"])
                    .slice(0, 3)
                    .map((p) => `<li>${escapeHtml(p)}</li>`)
                    .join("")}
                </ul>
              </div>
              <div style="margin-top: 16px;">
                <button class="button" data-action="product-section" data-section="strategy">
                  View Full Strategy →
                </button>
              </div>
            </div>
          </article>

          <!-- Top Priority Candidates -->
          <article class="card product-card">
            <div class="card-head">
              <h2>Top Ranked Features</h2>
              <button class="button" data-action="product-section" data-section="prioritization">
                Prioritization Matrix →
              </button>
            </div>
            <div class="card-body" style="padding: 0;">
              <div class="table-wrap" style="border: 0;">
                <table>
                  <thead>
                    <tr>
                      <th style="width: 60px;">Rank</th>
                      <th>Feature</th>
                      <th>Value</th>
                      <th>Effort</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${feats.slice(0, 4).map((f) => `
                      <tr>
                        <td><b class="product-rank-num">#${f.priorityRank}</b></td>
                        <td>
                          <strong>${escapeHtml(f.title)}</strong><br>
                          <span class="small subtle">${escapeHtml(f.rationale || "")}</span>
                        </td>
                        <td><span class="product-score-tag value">${f.businessValue}/10</span></td>
                        <td><span class="product-score-tag effort">${f.effort}/10</span></td>
                        <td>${status(f.status)}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        </div>

        <!-- Right Column: Roadmap Velocity & Recent Decisions -->
        <div class="product-bento-col">
          <!-- Roadmap Progress -->
          <article class="card product-card">
            <div class="card-head">
              <h2>Delivery Sequence</h2>
              <button class="button" data-action="product-section" data-section="roadmap">
                Roadmap Detail →
              </button>
            </div>
            <div class="card-body">
              <div class="product-roadmap-compact">
                ${roadmap.map((item) => `
                  <div class="product-compact-road-item status-${item.status}">
                    <div class="road-marker">
                      <span class="road-badge">${escapeHtml(item.release)}</span>
                    </div>
                    <div class="road-info">
                      <strong>${escapeHtml(item.milestone)}</strong>
                      <span class="small subtle">
                        ${escapeHtml(item.startDate || "TBD")} → ${escapeHtml(item.endDate || "TBD")}
                      </span>
                    </div>
                    <div>${status(item.status)}</div>
                  </div>
                `).join("")}
              </div>
            </div>
          </article>

          <!-- Decision Trace Summary -->
          <article class="card product-card">
            <div class="card-head">
              <h2>Audited Product Decisions</h2>
              <button class="button" data-action="product-section" data-section="decisions">
                Decision Trace Log →
              </button>
            </div>
            <div class="card-body" style="padding: 0;">
              <div class="product-decision-preview-list">
                ${decisions.slice(0, 3).map((d) => `
                  <div class="product-decision-compact">
                    <div class="decision-compact-top">
                      <span class="product-tag">${escapeHtml(d.type.replaceAll("_", " "))}</span>
                      ${provenanceBadge(d)}
                    </div>
                    <strong class="decision-compact-title">${escapeHtml(d.title)}</strong>
                    <p class="small subtle">${escapeHtml(d.rationale)}</p>
                  </div>
                `).join("")}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  `;
}
