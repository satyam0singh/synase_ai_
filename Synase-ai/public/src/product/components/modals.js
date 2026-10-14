import { escapeHtml } from "../../shared/components/ui.js";
import { state } from "../../shared/state/store.js";
import { lucideIcon } from "../../shared/components/icons.js";

/**
 * Renders the active Product modal if one is open.
 * @returns {string}
 */
export function productModal() {
  if (!state.productActiveModal) return "";

  const modalType = state.productActiveModal;

  if (modalType === "new_requirement") {
    return `
      <div class="product-modal-backdrop" data-action="close-modal">
        <div class="product-modal-box" onclick="event.stopPropagation()">
          <div class="product-modal-head">
            <h3>Add New Requirement</h3>
            <button class="icon-btn" data-action="close-modal" aria-label="Close modal">${lucideIcon('x', { size: 16 })}</button>
          </div>
          <form id="product-create-requirement-form" class="product-modal-body">
            <div class="field full">
              <label for="req-title">Requirement Title *</label>
              <input type="text" id="req-title" name="title" required placeholder="e.g. Audit trail encryption at rest" />
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="req-type">Type</label>
                <select id="req-type" name="type">
                  <option value="functional">Functional</option>
                  <option value="technical">Technical</option>
                  <option value="security">Security</option>
                  <option value="non_functional">Non-functional</option>
                  <option value="governance">Governance</option>
                </select>
              </div>

              <div class="field">
                <label for="req-priority">Priority</label>
                <select id="req-priority" name="priority">
                  <option value="critical">Critical</option>
                  <option value="high" selected>High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="deferred">Deferred</option>
                </select>
              </div>
            </div>

            <div class="field full">
              <label for="req-rationale">Rationale & Justification</label>
              <textarea id="req-rationale" name="rationale" rows="3" placeholder="Why is this requirement necessary?"></textarea>
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="req-evidence">Evidence Source</label>
                <input type="text" id="req-evidence" name="evidence" placeholder="e.g. Ingestion log, Security RFC" />
              </div>
              <div class="field">
                <label for="req-impact">Architecture Impact</label>
                <input type="text" id="req-impact" name="architectureImpact" placeholder="e.g. Storage adapter, auth gateway" />
              </div>
            </div>

            <div class="product-modal-footer">
              <button type="button" class="button ghost" data-action="close-modal">Cancel</button>
              <button type="submit" class="button primary">Save Requirement</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (modalType === "new_feature") {
    return `
      <div class="product-modal-backdrop" data-action="close-modal">
        <div class="product-modal-box" onclick="event.stopPropagation()">
          <div class="product-modal-head">
            <h3>Add Candidate Feature</h3>
            <button class="icon-btn" data-action="close-modal" aria-label="Close modal">${lucideIcon('x', { size: 16 })}</button>
          </div>
          <form id="product-create-feature-form" class="product-modal-body">
            <div class="field full">
              <label for="feat-title">Feature Title *</label>
              <input type="text" id="feat-title" name="title" required placeholder="e.g. Visual knowledge graph explorer" />
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="feat-val">Business Value (1-10)</label>
                <input type="number" id="feat-val" name="businessValue" min="1" max="10" value="8" />
              </div>
              <div class="field">
                <label for="feat-impact">Impact (1-10)</label>
                <input type="number" id="feat-impact" name="impact" min="1" max="10" value="8" />
              </div>
              <div class="field">
                <label for="feat-effort">Effort (1-10)</label>
                <input type="number" id="feat-effort" name="effort" min="1" max="10" value="5" />
              </div>
              <div class="field">
                <label for="feat-risk">Risk (1-10)</label>
                <input type="number" id="feat-risk" name="risk" min="1" max="10" value="3" />
              </div>
            </div>

            <div class="field full">
              <label for="feat-rationale">Rationale</label>
              <textarea id="feat-rationale" name="rationale" rows="3" placeholder="Context and decision motivation..."></textarea>
            </div>

            <div class="product-modal-footer">
              <button type="button" class="button ghost" data-action="close-modal">Cancel</button>
              <button type="submit" class="button primary">Add Feature</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (modalType === "new_roadmap") {
    return `
      <div class="product-modal-backdrop" data-action="close-modal">
        <div class="product-modal-box" onclick="event.stopPropagation()">
          <div class="product-modal-head">
            <h3>Add Roadmap Milestone</h3>
            <button class="icon-btn" data-action="close-modal" aria-label="Close modal">${lucideIcon('x', { size: 16 })}</button>
          </div>
          <form id="product-create-roadmap-form" class="product-modal-body">
            <div class="field full">
              <label for="road-milestone">Milestone Name *</label>
              <input type="text" id="road-milestone" name="milestone" required placeholder="e.g. Phase 3 Production Verification" />
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="road-release">Release Code</label>
                <input type="text" id="road-release" name="release" placeholder="e.g. R5" />
              </div>
              <div class="field">
                <label for="road-status">Status</label>
                <select id="road-status" name="status">
                  <option value="planned" selected>Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
            </div>

            <div class="form-grid">
              <div class="field">
                <label for="road-start">Start Date</label>
                <input type="date" id="road-start" name="startDate" />
              </div>
              <div class="field">
                <label for="road-end">Target Date</label>
                <input type="date" id="road-end" name="endDate" />
              </div>
            </div>

            <div class="field full">
              <label for="road-deps">Dependencies (comma separated IDs)</label>
              <input type="text" id="road-deps" name="dependencies" placeholder="e.g. ROAD-01, ROAD-02" />
            </div>

            <div class="product-modal-footer">
              <button type="button" class="button ghost" data-action="close-modal">Cancel</button>
              <button type="submit" class="button primary">Schedule Milestone</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (modalType === "edit_strategy") {
    const strat = state.productStrategy || { objective: "", principles: [], risks: [] };
    return `
      <div class="product-modal-backdrop" data-action="close-modal">
        <div class="product-modal-box" onclick="event.stopPropagation()">
          <div class="product-modal-head">
            <h3>Update Product Strategy</h3>
            <button class="icon-btn" data-action="close-modal" aria-label="Close modal">${lucideIcon('x', { size: 16 })}</button>
          </div>
          <form id="product-update-strategy-form" class="product-modal-body">
            <div class="field full">
              <label for="strat-objective">Core Strategic Objective *</label>
              <textarea id="strat-objective" name="objective" rows="3" required>${escapeHtml(strat.objective || "")}</textarea>
            </div>

            <div class="field full">
              <label for="strat-principles">Strategic Principles (one per line)</label>
              <textarea id="strat-principles" name="principles" rows="4">${escapeHtml((strat.principles || []).join("\n"))}</textarea>
            </div>

            <div class="field full">
              <label for="strat-risks">Known Strategic Risks (one per line)</label>
              <textarea id="strat-risks" name="risks" rows="4">${escapeHtml((strat.risks || []).join("\n"))}</textarea>
            </div>

            <div class="product-modal-footer">
              <button type="button" class="button ghost" data-action="close-modal">Cancel</button>
              <button type="submit" class="button primary">Save Strategy</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  if (modalType === "import_requirements") {
    return `
      <div class="product-modal-backdrop" data-action="close-modal">
        <div class="product-modal-box" onclick="event.stopPropagation()">
          <div class="product-modal-head">
            <h3>Import Requirements</h3>
            <button class="icon-btn" data-action="close-modal" aria-label="Close modal">${lucideIcon('x', { size: 16 })}</button>
          </div>
          <form id="product-import-requirements-form" class="product-modal-body">
            <div class="field full">
              <label for="import-req-content">Requirements (JSON array or line items) *</label>
              <textarea id="import-req-content" name="content" rows="6" required placeholder='[
  { "title": "Real-time streaming event bus", "type": "technical", "priority": "high" },
  { "title": "Zero-trust session validation", "type": "security", "priority": "critical" }
]'></textarea>
            </div>

            <div class="product-modal-footer">
              <button type="button" class="button ghost" data-action="close-modal">Cancel</button>
              <button type="submit" class="button primary">Import Requirements</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  return "";
}
