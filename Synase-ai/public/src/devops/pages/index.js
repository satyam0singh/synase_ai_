// @ts-check
/* DevOps Intelligence: architecture, quality, security, risk, testing, deployment. */
import { state } from "../../shared/state/store.js";
import { routes } from "../../app/paths.js";
import {
  pageHeader,
  status,
  notFound,
  escapeHtml,
  metricCard
} from "../../shared/components/ui.js";
import { findingsTable } from "../components/index.js";
export function devopsOverview() {
  const s = state.devopsSummary || {};
  const metrics = [["Architecture",s.architectureScore],["Code quality",s.qualityScore],["Security",s.securityScore],["Deployment readiness",s.deploymentReadiness]];
  return `<section class="metrics">${metrics.map(([label,value]) => metricCard({label,value:value == null?"—":`${Math.round(value*100)}%`,trend:"Mock evidence aggregate",tone:value<.7?"warning":"positive"})).join("")}</section>
    <div class="dashboard-grid"><article class="card"><div class="card-head"><h2>Open engineering findings</h2></div><div class="card-body">${findingsTable(state.findings)}</div></article><article class="card"><div class="card-head"><h2>Recommendations</h2></div><div class="card-body recommendation-list">${state.devopsRecommendations.map((item)=>`<div class="recommendation"><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.rationale)}</p><div class="cluster">${status(item.priority)}${status(item.approvalStatus)}<span class="proposal">Not executed</span></div></div>`).join("")}</div></article></div>`;
}

export function devopsDependencies() {
  return `<div class="table-wrap"><table><thead><tr><th>Dependency</th><th>Category</th><th>Version</th><th>Risk</th><th>Status</th></tr></thead><tbody>${state.dependencies.map((item)=>`<tr><td><strong>${escapeHtml(item.name)}</strong></td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.currentVersion)}</td><td>${status(item.risk)}</td><td>${status(item.status)}</td></tr>`).join("")}</tbody></table></div>`;
}

export function devopsTesting() {
  return `<div class="catalog-grid">${state.testSuggestions.map((item)=>`<article class="card catalog-card"><div class="card-body"><div class="catalog-head"><span class="catalog-glyph">T</span>${status(item.status)}</div><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.type)} testing</p><div class="cluster">${status(item.priority)}<span class="proposal">Suggestion · not executed</span></div></div></article>`).join("")}</div>`;
}

export function devopsDeployment() {
  return `<div class="catalog-grid">${state.deploymentPlans.map((plan)=>`<article class="card deployment-card"><div class="card-head"><div><h2>${escapeHtml(plan.title)}</h2><span class="small subtle">Plan only · never executed</span></div>${status(plan.status)}</div><div class="card-body"><div class="deployment-steps">${plan.steps.map((step)=>`<div><span>${step.sequence}</span><strong>${escapeHtml(step.title)}</strong>${status(step.status)}</div>`).join("")}</div><div class="alert">Approval required: ${plan.approvalRequired ? "Yes" : "No"}. Executed: No.</div></div></article>`).join("")}</div>`;
}

export function devopsIntelligencePage() {
  const tabs = [["overview","Overview"],["architecture","Architecture"],["quality","Quality"],["security","Security"],["dependencies","Dependencies"],["testing","Testing"],["risk","Risk"],["deployment","Deployment"]];
  let body = devopsOverview();
  if (["architecture","quality","security","risk"].includes(state.devopsTab)) body = findingsTable(state.findings.filter((item)=> state.devopsTab==="risk" || item.type === state.devopsTab || (state.devopsTab==="quality" && item.type==="testing")));
  if (state.devopsTab === "dependencies") body = devopsDependencies();
  if (state.devopsTab === "testing") body = devopsTesting();
  if (state.devopsTab === "deployment") body = devopsDeployment();
  return `${pageHeader("DevOps intelligence", "Engineering decisions", "Review architecture, quality, security, dependencies, testing, risk, and deployment plans with evidence.", `<button class="button primary" data-action="devops-mock" data-devops-domain="${state.devopsTab}">Run mock ${state.devopsTab}</button>`)}
    <div class="alert">Mock DevOps Intelligence. Findings and plans are evidence fixtures; no code, CI/CD, infrastructure, or deployment action is executed.</div>
    <div class="input-tabs page-tabs">${tabs.map(([key,label])=>`<button class="input-tab ${state.devopsTab===key?"active":""}" data-action="devops-tab" data-tab="${key}">${label}</button>`).join("")}</div>${body}`;
}
