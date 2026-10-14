// @ts-check
/* Reusable presentational building blocks. These render the same markup the
   monolithic app.js produced; only their location changed. */

import { escapeHtml } from "../utils/format.js";

/* Every view escapes as it interpolates, so it is re-exported here to keep view
   modules down to a single import from this layer. Owned by utils/format.js. */
export { escapeHtml };

/**
 * @param {string} value
 * @returns {string}
 */
export function status(value) {
  return `<span class="status ${escapeHtml(value)}">${escapeHtml(
    String(value).replaceAll("_", " ")
  )}</span>`;
}

/** @returns {string} */
export function loading() {
  return `<div class="loading"><div><div class="spinner"></div><div>Loading authoritative state…</div></div></div>`;
}

/**
 * @param {string} eyebrow
 * @param {string} title
 * @param {string} description
 * @param {string} [action]
 * @returns {string}
 */
export function pageHeader(eyebrow, title, description, action = "") {
  return `<div class="breadcrumbs"><span>SYNASE AI</span><span>/</span><b>${escapeHtml(
    title
  )}</b></div>
    <header class="page-header">
      <div><div class="eyebrow">${escapeHtml(eyebrow)}</div><h1>${escapeHtml(
    title
  )}</h1><p class="page-copy">${escapeHtml(description)}</p></div>
      ${action}
    </header>`;
}

/**
 * @param {{label?: string, value?: unknown, trend?: string, tone?: string}} metric
 * @returns {string}
 */
export function metricCard(metric) {
  return `<article class="metric ${metric.tone || ""}">
    <div class="metric-label">${escapeHtml(metric.label)}</div>
    <div class="metric-value">${escapeHtml(metric.value)}</div>
    <div class="metric-note">${escapeHtml(metric.trend || "")}</div>
  </article>`;
}

/**
 * @param {number} [value]
 * @returns {string}
 */
export function confidence(value = 0) {
  const percent = Math.round(value * 100);
  const label = value >= 0.85 ? "High" : value >= 0.65 ? "Moderate" : "Low";
  return `<div class="confidence" aria-label="${label} confidence, ${percent} percent"><div><span style="width:${percent}%"></span></div><b>${percent}%</b><small>${label}</small></div>`;
}

/**
 * Marks AI-suggested state distinctly from confirmed project state.
 * @param {{provenance?: string, confidence?: number}} item
 * @returns {string}
 */
export function provenance(item) {
  return item.provenance === "ai_suggested"
    ? `<span class="proposal">AI suggestion${
        item.confidence ? ` · ${Math.round(item.confidence * 100)}%` : ""
      }</span>`
    : `<span class="confirmed">Confirmed state</span>`;
}

/**
 * @param {string} title
 * @param {string} copy
 * @returns {string}
 */
export function notFound(title, copy) {
  return `<section class="card empty"><div><div class="empty-icon">?</div><h2>${escapeHtml(
    title
  )}</h2><p>${escapeHtml(copy)}</p><button class="button primary" data-route="/app/dashboard">Return to dashboard</button></div></section>`;
}

/**
 * Inline brand mark. Gradient stops reference the theme accent tokens so the
 * logo follows light and dark automatically.
 * @returns {string}
 */
export function brandMarkSvg() {
  return `<svg class="brand-mark-svg" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="pGradA" x1="0%" y1="0%" x2="1" y2="1"><stop offset="0%" stop-color="#3279f9"/><stop offset="100%" stop-color="#1a73e8"/></linearGradient>
      <linearGradient id="pGradB" x1="1" y1="0%" x2="0" y2="1"><stop offset="0%" stop-color="#3279f9"/><stop offset="100%" stop-color="#1a73e8"/></linearGradient>
      <linearGradient id="pGradC" x1="0%" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#1557b0"/><stop offset="100%" stop-color="#45474d"/></linearGradient>
    </defs>
    <g stroke-linejoin="round" stroke-linecap="round">
      <path d="M50 6 L92 78 L76 78 L42 20 L50 6 Z" fill="url(#pGradA)" fill-opacity="0.25" stroke="#3279f9" stroke-width="2.2" />
      <path d="M92 78 L8 78 L16 64 L76 64 L76 78 Z" fill="url(#pGradB)" fill-opacity="0.28" stroke="#1557b0" stroke-width="2.2" />
      <path d="M8 78 L50 6 L58 20 L24 78 L8 78 Z" fill="url(#pGradC)" fill-opacity="0.22" stroke="#45474d" stroke-width="2.2" />
      <path d="M42 20 L58 20 L30 68 L74 68 L66 54 L38 54 L50 34" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.6" fill="none" />
    </g>
  </svg>`;
}