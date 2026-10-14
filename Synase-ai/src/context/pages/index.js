// @ts-check
/* Shared context: explorer, memory, retrieval history, knowledge graph. */
import { state } from "../../shared/state/store.js";
import { routes } from "../../app/paths.js";
import {
  pageHeader,
  status,
  notFound,
  escapeHtml
} from "../../shared/components/ui.js";
export function contextTabs(active) {
  const tabs = [["overview","Context explorer"],["memory","Memory"],["history","Retrieval history"]];
  return `<div class="input-tabs page-tabs">${tabs.map(([key,label])=>`<button class="input-tab ${active===key?"active":""}" data-route="/app/context/${key}">${label}</button>`).join("")}</div>`;
}

export function contextOverviewPage() {
  return `${pageHeader("Shared context", "Context explorer", "Inspect project-scoped context with sensitivity, trust, source, and processing state.", `<button class="button primary" data-action="context-mock" data-context-action="reindex">Run mock reindex</button>`)}
    <div class="alert">Mock context projection. ChromaDB, object storage, and source systems remain backend-only and are not contacted.</div>
    ${contextTabs("overview")}
    <div class="table-wrap"><table><thead><tr><th>Context item</th><th>Type / source</th><th>Scope</th><th>Sensitivity</th><th>Trust</th><th>Status</th></tr></thead><tbody>${state.contextItems.map((item)=>`<tr><td><strong>${escapeHtml(item.title)}</strong><br><span class="small">${escapeHtml(item.id)}</span></td><td>${escapeHtml(item.type)}<br><span class="small">${escapeHtml(item.source)}</span></td><td>${status(item.scope)}</td><td>${status(item.sensitivity)}</td><td>${status(item.trustLevel)}</td><td>${status(item.status)}</td></tr>`).join("")}</tbody></table></div>`;
}

export function memoryPage() {
  const results = state.memoryResults;
  return `${pageHeader("Shared context", "Memory", "Search safe project memory projections with explicit relevance, source, sensitivity, and trust.")}
    <div class="alert">Mock semantic retrieval. No embedding vector, Chroma collection, or raw storage identifier is exposed.</div>
    ${contextTabs("memory")}
    <form id="memory-search-form" class="search-panel"><label for="memory-query">Search project memory</label><div class="search-row"><input id="memory-query" name="query" value="${escapeHtml(state.contextQuery)}" placeholder="Try: API boundaries"><button class="button primary" type="submit">Search mock memory</button></div></form>
    <div class="memory-grid">${results.map((item)=>`<article class="card memory-card"><div class="card-body"><div class="cluster">${status(item.trustLevel)}${status(item.sensitivity)}<span class="score">${Math.round(item.relevance*100)}% relevance</span></div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.excerpt)}</p><small>Source: ${escapeHtml(item.sourceContextId)}</small></div></article>`).join("") || `<section class="card empty compact-empty"><div><h2>No matching memory</h2><p>Try a broader project-scoped query.</p></div></section>`}</div>`;
}

export function retrievalHistoryPage() {
  return `${pageHeader("Shared context", "Retrieval history", "Review ranked retrieval evidence without exposing embeddings or internal store identifiers.")}
    <div class="alert">History is a safe API projection. Scores support review and are not represented as certainty.</div>
    ${contextTabs("history")}
    <div class="history-list">${state.retrievalHistory.map((record)=>`<article class="card retrieval-card"><div class="card-head"><div><h2>${escapeHtml(record.query)}</h2><span class="small">${new Date(record.createdAt).toLocaleString()}</span></div>${status(record.status)}</div><div class="card-body">${record.items.map((item)=>`<div class="retrieval-row"><span class="rank">${item.rank}</span><div><strong>${escapeHtml(item.memoryId)}</strong><p>${escapeHtml(item.reason)}</p></div><span class="score">${Math.round(item.score*100)}%</span></div>`).join("")}</div></article>`).join("")}</div>`;
}

export function knowledgeGraphPage() {
  const graph = state.knowledgeGraph;
  const nodeById = new Map((graph?.nodes || []).map((node)=>[node.id,node]));
  return `${pageHeader("Knowledge", "Knowledge graph", "Inspect project relationships as a safe domain projection with an accessible textual representation.", `<button class="button primary" data-action="context-mock" data-context-action="graph_sync">Run mock graph sync</button>`)}
    <div class="alert">${escapeHtml(graph?.storageBoundary || "Knowledge graph unavailable.")} No Neo4j credentials, queries, or internal IDs are exposed.</div>
    <section class="graph-layout"><article class="card"><div class="card-head"><div><h2>Relationship map</h2><span class="small">${graph?.nodes?.length || 0} nodes · ${graph?.edges?.length || 0} relationships</span></div>${status(graph?.status || "warning")}</div><div class="card-body graph-canvas" aria-hidden="true">${(graph?.nodes||[]).map((node,index)=>`<div class="graph-node node-${index+1}"><span>${escapeHtml(node.type)}</span><strong>${escapeHtml(node.label)}</strong></div>`).join("")}</div></article>
    <article class="card"><div class="card-head"><h2>Accessible relationships</h2></div><div class="card-body relationship-list">${(graph?.edges||[]).map((edge)=>`<div><strong>${escapeHtml(nodeById.get(edge.sourceId)?.label || edge.sourceId)}</strong><span>${escapeHtml(edge.type.replaceAll("_"," "))}</span><strong>${escapeHtml(nodeById.get(edge.targetId)?.label || edge.targetId)}</strong></div>`).join("")}</div></article></section>`;
}
