// @ts-check
/* Shared DevOps presentation pieces. */
import { status, escapeHtml } from "../../shared/components/ui.js";
import { state } from "../../shared/state/store.js";
export function findingsTable(items = state.findings) {
  return `<div class="table-wrap"><table><thead><tr><th>Finding</th><th>Type</th><th>Severity</th><th>Affected location</th><th>Status</th></tr></thead><tbody>${items.map((item) => `<tr><td><strong>${escapeHtml(item.id)} · ${escapeHtml(item.title)}</strong><br><span class="small">${escapeHtml(item.evidence)}</span></td><td>${escapeHtml(item.type)}</td><td>${status(item.severity)}</td><td>${escapeHtml(item.affectedLocation || "—")}</td><td>${status(item.status)}</td></tr>`).join("")}</tbody></table></div>`;
}
