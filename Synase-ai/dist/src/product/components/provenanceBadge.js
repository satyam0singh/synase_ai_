// @ts-check
import { escapeHtml } from "../../shared/components/ui.js";

/**
 * Renders a strict provenance badge with confidence indicator.
 * @param {{ provenance?: string, confidence?: number }} item
 * @returns {string}
 */
export function provenanceBadge(item) {
  if (!item) return "";
  const isSuggested = item.provenance === "ai_suggested";
  const confPercent = item.confidence ? Math.round(item.confidence * 100) : 75;

  if (isSuggested) {
    return `
      <span class="product-badge proposal" title="AI Suggestion · Confidence ${confPercent}%">
        <span class="product-badge-dot"></span>
        AI Suggestion ${item.confidence ? `· ${confPercent}%` : ""}
      </span>
    `;
  }

  return `
    <span class="product-badge confirmed" title="Verified Authoritative State">
      <span class="product-badge-dot"></span>
      Confirmed
    </span>
  `;
}

/**
 * Formats a score dimension pill (e.g. Value: 9/10).
 * @param {string} label
 * @param {number|string} val
 * @param {string} [tone]
 * @returns {string}
 */
export function scorePill(label, val, tone = "") {
  return `
    <div class="product-score-pill ${escapeHtml(tone)}">
      <span class="pill-label">${escapeHtml(label)}</span>
      <b class="pill-val">${escapeHtml(String(val))}</b>
    </div>
  `;
}
