// @ts-check
/* The one router.

   Before this refactor three modules each decided they owned #main:
   app.js, phase11.js and phase12.js. Each re-read location.hash on its own and
   wrote into the same element from a MutationObserver, so which render won was
   not statically determined. phase12 always won on /app/dashboard and phase11
   always won on the integrations/activity/audit routes; everywhere else app.js
   won.

   Those outcomes are now declared rather than raced. */

import { state } from "../shared/state/store.js";
import { loading, notFound } from "../shared/components/ui.js";
import { shell } from "./shell.js";
import { routes, currentPath, isIntegrationsRoute } from "./paths.js";

import { authPage } from "./auth.js";

import { projectsPage, createProjectPage, projectOverviewPage } from "../home/workspace/pages/projects.js";
import { membersPage } from "../home/workspace/pages/members.js";
import { repositoryPage } from "../home/workspace/pages/repository.js";
import { inputsPage } from "../home/workspace/pages/inputs.js";
import { analysisPage } from "../home/workspace/pages/analysis.js";
import { runsPage } from "../home/workspace/pages/runs.js";
import { decisionDashboardPage } from "../home/workspace/dashboard/view.js?v=6";
import { workspaceSettingsPage, projectSettingsPage } from "../home/settings/pages/index.js";

import { productIntelligencePage } from "../product/pages/index.js";
import { devopsIntelligencePage } from "../devops/pages/index.js";
import { mcpPage } from "../mcp/pages/index.js";
import {
  contextOverviewPage,
  memoryPage,
  retrievalHistoryPage,
  knowledgeGraphPage
} from "../context/pages/index.js";
import {
  reportsPage,
  reportDetailPage,
  approvalsPage
} from "../outputs/pages/index.js";
import { integrationsPage } from "../integrations/pages/index.js";
import { chatPage } from "../work/pages/index.js";
import { settingsControlPlanePage } from "../settings/pages/index.js";

/**
 * Resolves the current path to its page body, wrapped in the shell.
 * @returns {string}
 */
export function renderPage() {
  const path = currentPath();

  /* auth screens render without the console chrome */
  if (path.startsWith("/auth/")) {
    if (path.includes("register")) return authPage("register");
    if (path.includes("forgot")) return authPage("forgot");
    return authPage("login");
  }

  /* Chat renders standalone: no console chrome, it owns the viewport.
     Checked before the loading branch so the page never flashes the shell.
     "Work" is the dashboard below, which stays inside the shell. */
  const chat = path.match(/^\/app\/chat(?:\/([^/]+))?$/);
  if (chat) return chatPage();

  /* Settings renders standalone: full-page experience, owns the viewport.
     No console shell sidebar or double-box clustering. */
  const settingsMatch = path.match(/^\/app\/settings(?:\/([a-z0-9-]+))?$/);
  if (settingsMatch) {
    const sec = settingsMatch[1] || "general";
    state.settingsSection = sec;
    return settingsControlPlanePage(sec);
  }
  if (path.includes("/workspaces/") && path.endsWith("/settings"))
    return settingsControlPlanePage("workspace");

  if (state.loading) return shell(loading());

  /* declared owner: Work view = decision dashboard (was src/phase12.js) */
  if (path === routes.dashboard) return shell(decisionDashboardPage());

  /* declared owner: integrations (was src/phase11.js) */
  if (isIntegrationsRoute(path)) return shell(integrationsPage(path));

  if (path === routes.projects) return shell(projectsPage());
  if (path === routes.createProject) return shell(createProjectPage());
  if (path.includes("/workspaces/") && path.endsWith("/members"))
    return shell(membersPage());

  const repository = path.match(/^\/app\/projects\/([^/]+)\/repository$/);
  if (repository) return shell(repositoryPage(repository[1]));
  const inputs = path.match(/^\/app\/projects\/([^/]+)\/inputs$/);
  if (inputs) return shell(inputsPage(inputs[1]));
  const analysis = path.match(/^\/app\/projects\/([^/]+)\/analysis$/);
  if (analysis) return shell(analysisPage(analysis[1]));
  const runs = path.match(/^\/app\/projects\/([^/]+)\/runs$/);
  if (runs) return shell(runsPage(runs[1]));

  const mcp = path.match(/^\/app\/mcp(?:\/(overview|executions|tools|models|discovery))?$/);
  if (mcp) return shell(mcpPage(mcp[1] || "overview"));

  const product = path.match(/^\/app\/intelligence\/product(?:\/(overview|requirements|prioritization|strategy|roadmap|decisions))?$/);
  if (product) {
    if (product[1]) {
      state.productSection = product[1];
      state.productTab = product[1];
    }
    return shell(productIntelligencePage());
  }
  if (path === "/app/intelligence/devops") return shell(devopsIntelligencePage());

  if (path === "/app/context/overview") return shell(contextOverviewPage());
  if (path === "/app/context/memory") return shell(memoryPage());
  if (path === "/app/context/history") return shell(retrievalHistoryPage());
  if (path === "/app/knowledge/graph") return shell(knowledgeGraphPage());

  if (path === "/app/reports") return shell(reportsPage());
  const report = path.match(/^\/app\/reports\/([^/]+)$/);
  if (report) return shell(reportDetailPage(report[1]));
  if (path === "/app/approvals") return shell(approvalsPage());

  const overview = path.match(/^\/app\/projects\/([^/]+)\/overview$/);
  if (overview) return shell(projectOverviewPage(overview[1]));
  const settings = path.match(/^\/app\/projects\/([^/]+)\/settings$/);
  if (settings) return shell(projectSettingsPage(settings[1]));

  return shell(
    notFound(
      "Page not found",
      "This route is not part of the completed Phase 0–2 build."
    )
  );
}