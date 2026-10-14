// @ts-check
/* Decision outputs: reports and the human approval queue. */
import { state } from "../../shared/state/store.js";
import { routes } from "../../app/paths.js";
import {
  pageHeader,
  status,
  notFound,
  escapeHtml,
  confidence
} from "../../shared/components/ui.js";
export function reportsPage() {
  return `${pageHeader("Decision outputs", "Decision reports", "Review project-scoped reports, evidence, confidence, decisions, and approval state.", `<button class="button primary" data-action="generate-report">Generate mock receipt</button>`)}
    <div class="alert">Provisional global route using the selected project. Generation creates a queued mock receipt only; no AI workflow or report generation runs.</div>
    <div class="report-grid">${state.reports.map((report)=>`<article class="card report-card"><div class="card-head"><div><span class="small">${escapeHtml(report.type.replaceAll("_"," "))} · v${report.version}</span><h2>${escapeHtml(report.title)}</h2></div>${status(report.status)}</div><div class="card-body"><p>${escapeHtml(report.summary)}</p>${confidence(report.confidence)}<div class="report-meta"><span>Approval</span>${status(report.approvalStatus)}</div><button class="button" data-route="/app/reports/${report.id}">Review report</button></div></article>`).join("") || `<section class="card empty"><div><h2>No reports</h2><p>No report artifacts exist for this project.</p></div></section>`}</div>`;
}

export function reportDetailPage(reportId) {
  const report = state.reportDetail?.id === reportId ? state.reportDetail : state.reports.find((item)=>item.id===reportId);
  if (!report) return notFound("Report not found", "This report is outside the selected project or does not exist.");
  return `${pageHeader("Decision report", report.title, `${report.type.replaceAll("_"," ")} · Version ${report.version}`, `<div class="cluster"><button class="button" data-action="export-report" data-report-id="${report.id}">Mock export</button><button class="button primary" data-action="publish-report" data-report-id="${report.id}">Publish receipt</button></div>`)}
    <div class="alert">Report content is a deterministic fixture. Export and publication return receipts only; no binary is generated and nothing is published.</div>
    <section class="report-hero card"><div class="card-body"><div class="report-summary"><div><span class="small">Summary</span><p>${escapeHtml(report.summary)}</p></div>${confidence(report.confidence)}</div><div class="cluster">${status(report.status)}${status(report.approvalStatus)}<span class="proposal">v${report.version}</span></div></div></section>
    <div class="report-detail-grid"><div class="report-sections">${[...report.sections].sort((a,b)=>a.sequence-b.sequence).map((section)=>`<article class="card"><div class="card-head"><span class="section-index">${section.sequence}</span><h2>${escapeHtml(section.title)}</h2></div><div class="card-body"><p>${escapeHtml(section.content)}</p></div></article>`).join("")}</div>
    <aside class="report-aside"><article class="card"><div class="card-head"><h2>Evidence & references</h2></div><div class="card-body reference-list">${report.references.map((ref)=>`<div><strong>${escapeHtml(ref.label)}</strong><span>${escapeHtml(ref.sourceType)} · ${escapeHtml(ref.sourceId)}</span>${status(ref.trustLevel)}</div>`).join("")}</div></article></aside></div>
    <h2 class="section-title">Decisions</h2><div class="decision-grid">${report.decisions.map((decision)=>`<article class="card decision-card"><div class="card-body"><div class="cluster">${status(decision.impact)}${status(decision.status)}<span class="proposal">${escapeHtml(decision.provenance.replaceAll("_"," "))}</span></div><h2>${escapeHtml(decision.title)}</h2><p>${escapeHtml(decision.rationale)}</p>${confidence(decision.confidence)}<div class="alert">Executed: No</div></div></article>`).join("")}</div>`;
}

export function approvalsPage() {
  const selected = state.approvalDetail || state.approvals.find((item)=>item.id===state.approvalId) || state.approvals[0];
  return `${pageHeader("Human approval", "Approval queue", "Review high-impact requests and record explicit human decisions without implying downstream execution.")}
    <div class="alert">Provisional global route using the selected project. Approval changes authorization state only; it never proves that code, CI/CD, infrastructure, publication, or deployment executed.</div>
    <div class="approval-layout"><section class="card"><div class="card-head"><div><h2>Requests</h2><span class="small">${state.approvals.filter((item)=>item.status==="pending").length} pending</span></div></div><div class="approval-list">${state.approvals.map((item)=>`<button class="approval-row ${selected?.id===item.id?"active":""}" data-action="select-approval" data-approval-id="${item.id}"><div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.type.replaceAll("_"," "))} · ${escapeHtml(item.risk)} risk</span></div>${status(item.status)}</button>`).join("")}</div></section>
    ${selected ? `<section class="card approval-detail"><div class="card-head"><div><span class="small">${escapeHtml(selected.type.replaceAll("_"," "))}</span><h2>${escapeHtml(selected.title)}</h2></div>${status(selected.status)}</div><div class="card-body"><p>${escapeHtml(selected.rationale)}</p><dl class="detail-list"><div><dt>Requested by</dt><dd>${escapeHtml(selected.requestedBy)}</dd></div><div><dt>Requested</dt><dd>${new Date(selected.requestedAt).toLocaleString()}</dd></div><div><dt>Risk</dt><dd>${escapeHtml(selected.risk)}</dd></div><div><dt>Executed</dt><dd>No</dd></div></dl>
      ${selected.status==="pending" ? `<form id="approval-decision-form"><input type="hidden" name="approvalId" value="${selected.id}"><div class="field"><label for="approval-rationale">Decision rationale</label><textarea id="approval-rationale" name="rationale" placeholder="Record why this decision is appropriate"></textarea></div><div class="cluster"><button class="button success" name="decision" value="approve">Approve</button><button class="button danger" name="decision" value="reject">Reject</button><button type="button" class="button ghost" data-action="cancel-approval" data-approval-id="${selected.id}">Cancel request</button></div></form>` : `<div class="alert">Decision recorded. Downstream executed: No.</div>`}
      <h3>Comments</h3><div class="comment-list">${selected.comments.map((comment)=>`<div><strong>${escapeHtml(comment.author)}</strong><p>${escapeHtml(comment.text)}</p><span>${new Date(comment.createdAt).toLocaleString()}</span></div>`).join("") || `<p class="subtle">No comments.</p>`}</div>
      <form id="approval-comment-form"><input type="hidden" name="approvalId" value="${selected.id}"><div class="search-row"><input name="text" placeholder="Add review context" required><button class="button" type="submit">Add mock comment</button></div></form></div></section>` : ""}</div>`;
}
