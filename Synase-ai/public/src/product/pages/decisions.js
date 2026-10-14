// @ts-check
import { escapeHtml } from "../../shared/components/ui.js";
import { state } from "../../shared/state/store.js";
import { provenanceBadge } from "../components/provenanceBadge.js";

/**
 * Product Decision Trace Log: Audited trail linking product decisions to evidence, subjects, and impact.
 * @returns {string}
 */
export function decisionsView() {
  const decisions = state.productDecisions || [];

  return `
    <div class="product-section-layout">
      <!-- Toolbar -->
      <div class="product-toolbar">
        <div>
          <h2 style="font-size: 16px; margin: 0 0 4px;">Audited Product Decisions & Trade-Off Log</h2>
          <p class="small subtle" style="margin: 0;">
            Immutable decision log tracing product scope, requirement trade-offs, and roadmap sequence justifications.
          </p>
        </div>

        <div class="product-toolbar-right">
          <span class="product-tag">${decisions.length} Decisions Logged</span>
        </div>
      </div>

      <!-- Audit Integrity Banner -->
      <div class="product-audit-notice">
        <div class="audit-icon">🛡</div>
        <div class="audit-text">
          <strong>Decision Provenance & Audit Integrity:</strong>
          Every product decision records author identity, timestamp, linked subject (Requirement, Feature, or Milestone), and repository evidence. AI recommendations remain clearly distinguishable from human sign-offs.
        </div>
      </div>

      <!-- Decision Cards List -->
      <div class="product-decisions-list">
        ${decisions.map((dec) => {
          const typeLabel = dec.type.replaceAll("_", " ").toUpperCase();
          const isAi = dec.provenance === "ai_suggested";

          return `
            <article class="card product-decision-card ${isAi ? "is-suggested" : ""}">
              <div class="card-head product-decision-head">
                <div class="decision-meta-left">
                  <span class="decision-type-tag">${escapeHtml(typeLabel)}</span>
                  <span class="decision-id-label">${escapeHtml(dec.id)}</span>
                  <span class="decision-subject-link">Subject: <b>${escapeHtml(dec.subjectId)}</b></span>
                </div>
                <div class="decision-meta-right">
                  ${provenanceBadge(dec)}
                </div>
              </div>

              <div class="card-body">
                <h3 class="product-decision-title">${escapeHtml(dec.title)}</h3>

                <div class="product-decision-rationale">
                  <span class="small subtle">Rationale:</span>
                  <p>${escapeHtml(dec.rationale)}</p>
                </div>

                <div class="product-decision-meta-grid">
                  <div class="meta-block">
                    <span class="small subtle">Decided By</span>
                    <strong>${escapeHtml(dec.decidedBy)}</strong>
                  </div>
                  <div class="meta-block">
                    <span class="small subtle">Timestamp</span>
                    <span>${escapeHtml(new Date(dec.decidedAt).toLocaleString())}</span>
                  </div>
                  <div class="meta-block">
                    <span class="small subtle">Impact</span>
                    <span class="product-impact-text">${escapeHtml(dec.impact)}</span>
                  </div>
                </div>

                ${dec.evidence?.length ? `
                  <div class="product-decision-evidence">
                    <span class="small subtle">Grounded Evidence:</span>
                    <div class="evidence-tags">
                      ${dec.evidence.map((ev) => `<span class="product-tag">${escapeHtml(ev)}</span>`).join(" ")}
                    </div>
                  </div>
                ` : ""}
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </div>
  `;
}
