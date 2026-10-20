// @ts-check
/* Application entry point.

   Owns: state hydration, data loading (including the routes the former
   phase11/phase12 plugins loaded themselves), and the one delegated event
   listener for every route group. Views and API surfaces live in the domain
   folders; this file orchestrates only. */

import { ApiError, createIdempotencyKey, normalizeWorkflowEvents } from "../shared/api/index.js";
import { workspaceApi } from "../home/workspace/api/index.js";
import { productApi } from "../product/api/index.js";
import { devopsApi } from "../devops/api/index.js";
import { mcpApi } from "../mcp/api/index.js";
import { contextApi } from "../context/api/index.js";
import { outputsApi } from "../outputs/api/index.js";
import { phase11Api, createPhase11IdempotencyKey } from "../integrations/api/client.js";
import { phase12Api } from "../home/workspace/dashboard/api.js";
import { settingsApi } from "../settings/api/index.js";
import { createWorkController } from "./actions/work.js";

import { state, resetProjectScope } from "../shared/state/store.js";
import { escapeHtml } from "../shared/utils/format.js";
import { projectRows } from "../home/workspace/pages/projects.js";
import { assetTable } from "../home/workspace/pages/inputs.js";
import { initTheme, setTheme, syncToggles } from "../shared/services/theme.js";

import { renderPage } from "./router.js";
import { routes, currentPath, navigate, isIntegrationsRoute } from "./paths.js";

const app = document.querySelector("#app");

/**
 * @param {string} message
 */
function toast(message) {
  state.toast = message;
  render();
  setTimeout(() => {
    state.toast = "";
    render();
  }, 2800);
}

export function render() {
  app.innerHTML = renderPage();
  syncToggles();
  queueMicrotask(() => {
    const activeTab = document.querySelector(".page-tabs .input-tab.active");
    const strip = activeTab?.parentElement;
    if (activeTab && strip && strip.scrollWidth > strip.clientWidth) {
      strip.scrollLeft = activeTab.offsetLeft - (strip.clientWidth - activeTab.clientWidth) / 2;
    }
  });
}

/* The Chat & Work surface has its own controller so this module stays an
   orchestrator rather than an accumulator. render/toast are injected because
   they close over the router and the shell. */
const work = createWorkController({ render, toast });

/* ── route-scoped data ────────────────────────────────────────────────
   The former phase12 dashboard and phase11 integrations pages each fetched
   their own data on route entry. That logic lives here now so there is one
   loader instead of three. */

async function loadDashboard() {
  if (currentPath() !== routes.dashboard || state.loading) return;
  state.decisionDashboardError = "";
  try {
    state.decisionDashboard = (await phase12Api.getDashboard()).data;
  } catch (error) {
    state.decisionDashboardError =
      error instanceof Error ? error.message : "Dashboard contract failed.";
  }
  render();
}

async function loadSettings(workspaceId = state.workspaceId, projectId = state.projectId) {
  try {
    const [effectiveRes, keysRes, connRes, autoRes, policyRes] = await Promise.all([
      settingsApi.getEffectiveSettings({ workspaceId, projectId }),
      settingsApi.listApiKeys({ workspaceId }),
      settingsApi.listConnectors({ workspaceId }),
      settingsApi.listAutomations({ workspaceId }),
      settingsApi.getAgentPolicy({ workspaceId })
    ]);
    const map = {};
    for (const item of (effectiveRes.data || [])) {
      map[item.id] = item;
    }
    state.effectiveSettings = map;
    state.apiKeys = keysRes.data || [];
    state.settingsConnectors = connRes.data || [];
    state.settingsAutomations = autoRes.data || [];
    state.agentPolicy = policyRes.data || null;
  } catch (error) {
    console.warn("Settings hydration fallback:", error);
  }
}

async function loadIntegrations(filters = {}) {
  const path = currentPath();
  if (!isIntegrationsRoute(path)) return;
  const routeProject = path.match(/^\/app\/projects\/([^/]+)\/integrations$/)?.[1];
  state.projectId =
    routeProject ||
    document.querySelector("#project-switcher")?.value ||
    state.projectId;
  state.integrationError = "";
  try {
    if (path.includes("integrations")) {
      const [providers, connections, runs] = await Promise.all([
        phase11Api.listIntegrationProviders(),
        phase11Api.listIntegrationConnections(state.projectId),
        phase11Api.listIntegrationRuns(state.projectId)
      ]);
      state.integrationProviders = providers.data;
      state.integrationConnections = connections.data;
      state.integrationRuns = runs.data;
    } else if (path === "/app/activity") {
      state.activity = (await phase11Api.listActivity(state.projectId, filters)).data;
    } else {
      state.auditEvents = (await phase11Api.listAuditEvents(state.projectId, filters)).data;
    }
  } catch (error) {
    state.integrationError =
      error instanceof Error ? error.message : "Mock adapter error";
  }
  render();
}

/* ── hydration ────────────────────────────────────────────────────── */

async function hydrate(workspaceId = state.workspaceId) {
  state.loading = true;
  render();
  try {
    const [
      me, workspaces, projects, members,
      mcpOverview, mcpRequests, mcpModels, mcpTools, mcpServers, mcpDirectories
    ] = await Promise.all([
      workspaceApi.getMe(),
      workspaceApi.listWorkspaces(),
      workspaceApi.listProjects(workspaceId),
      workspaceApi.listWorkspaceMembers(),
      mcpApi.getOverview(),
      mcpApi.listRequests(),
      mcpApi.listModels(),
      mcpApi.listTools(),
      mcpApi.listServers(),
      mcpApi.listDirectories()
    ]);
    state.user = me.data;
    state.workspaces = workspaces.data;
    state.workspaceId = workspaceId;
    state.projects = projects.data;
    state.members = members.data;
    state.mcpOverview = mcpOverview.data;
    state.mcpRequests = mcpRequests.data;
    state.mcpModels = mcpModels.data;
    state.mcpTools = mcpTools.data;
    state.mcpServers = mcpServers.data;
    state.mcpDirectories = mcpDirectories.data;
    state.mcpRequestId = state.mcpRequests[0]?.id || "";
    state.mcpTrace = state.mcpRequestId
      ? (await mcpApi.getTrace(state.mcpRequestId)).data
      : [];
    if (!state.projects.some((p) => p.id === state.projectId))
      state.projectId = state.projects[0]?.id || "";
    if (state.projectId) {
      await hydrateProject(state.projectId);
    } else {
      resetProjectScope();
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : "Unable to load the workspace.";
  } finally {
    state.loading = false;
    render();
  }
}

/**
 * Loads every project-scoped domain projection. Called on first load and on
 * project switch.
 * @param {string} projectId
 */
async function hydrateProject(projectId) {
  const [repositories, assets, conversations, requests, workflows] = await Promise.all([
    workspaceApi.listRepositories(projectId),
    workspaceApi.listAssets(projectId),
    workspaceApi.listConversations(projectId),
    workspaceApi.listAnalysisRequests(projectId),
    workspaceApi.listWorkflows(projectId)
  ]);
  state.repositories = repositories.data;
  state.assets = assets.data;
  state.conversations = conversations.data;
  state.analysisRequests = requests.data;
  state.workflows = workflows.data;
  state.workflowId = workflows.data[0]?.id || "";
  if (state.workflowId) {
    const [tasks, events] = await Promise.all([
      workspaceApi.listWorkflowTasks(projectId, state.workflowId),
      workspaceApi.listWorkflowEvents(projectId, state.workflowId)
    ]);
    state.workflowTasks = tasks.data;
    state.workflowEvents = normalizeWorkflowEvents(events.data);
  } else {
    state.workflowTasks = [];
    state.workflowEvents = [];
  }

  const [requirements, features, strategy, roadmap, decisions, overview] = await Promise.all([
    productApi.listRequirements(projectId),
    productApi.listProductFeatures(projectId),
    productApi.getProductStrategy(projectId),
    productApi.listRoadmapItems(projectId),
    productApi.listProductDecisions(projectId),
    productApi.getProductOverview(projectId)
  ]);
  state.requirements = requirements.data;
  state.productFeatures = features.data;
  state.productStrategy = strategy.data;
  state.roadmapItems = roadmap.data;
  state.productDecisions = decisions.data;
  state.productOverview = overview.data;

  const [devopsSummary, findings, recommendations, dependencies, tests, deployments] =
    await Promise.all([
      devopsApi.getDevOpsSummary(projectId),
      devopsApi.listFindings(projectId),
      devopsApi.listDevOpsRecommendations(projectId),
      devopsApi.listDependencies(projectId),
      devopsApi.listTestSuggestions(projectId),
      devopsApi.listDeploymentPlans(projectId)
    ]);
  state.devopsSummary = devopsSummary.data;
  state.findings = findings.data;
  state.devopsRecommendations = recommendations.data;
  state.dependencies = dependencies.data;
  state.testSuggestions = tests.data;
  state.deploymentPlans = deployments.data;

  const [contextItems, memory, history, graph] = await Promise.all([
    contextApi.listContextItems(projectId),
    contextApi.searchMemory(projectId),
    contextApi.listRetrievalHistory(projectId),
    contextApi.getKnowledgeGraph(projectId)
  ]);
  state.contextItems = contextItems.data;
  state.memoryResults = memory.data;
  state.retrievalHistory = history.data;
  state.knowledgeGraph = graph.data;

  const [reports, approvals] = await Promise.all([
    outputsApi.listReports(projectId),
    outputsApi.listApprovals(projectId)
  ]);
  state.reports = reports.data;
  state.reportId = reports.data[0]?.id || "";
  state.reportDetail = state.reportId
    ? (await outputsApi.getReport(projectId, state.reportId)).data
    : null;
  state.approvals = approvals.data;
  state.approvalId = approvals.data[0]?.id || "";
  state.approvalDetail = state.approvalId
    ? (await outputsApi.getApproval(projectId, state.approvalId)).data
    : null;

  state.conversationId = state.conversations[0]?.id || "";
  state.messages = state.conversationId
    ? (await workspaceApi.listMessages(projectId, state.conversationId)).data
    : [];

  await loadSettings(state.workspaceId, projectId);
}

/* ── delegated events ─────────────────────────────────────────────── */

document.addEventListener("click", async (event) => {
  /* Password visibility toggle (Auth 4 feature) */
  const toggleBtn = event.target instanceof Element
    ? event.target.closest("[data-toggle-password]")
    : null;
  if (toggleBtn) {
    const inputId = toggleBtn.getAttribute("data-toggle-password");
    const input = inputId ? /** @type {HTMLInputElement|null} */ (document.getElementById(inputId)) : null;
    if (input) {
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      const eyeShow = /** @type {HTMLElement|null} */ (toggleBtn.querySelector(".eye-show"));
      const eyeHide = /** @type {HTMLElement|null} */ (toggleBtn.querySelector(".eye-hide"));
      if (eyeShow && eyeHide) {
        eyeShow.style.display = isPassword ? "none" : "block";
        eyeHide.style.display = isPassword ? "block" : "none";
      }
      toggleBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
    }
    return;
  }

  /* Enterprise OAuth / SSO buttons (Auth 4 feature) */
  const ssoBtn = event.target instanceof Element ? event.target.closest("[data-sso]") : null;
  if (ssoBtn) {
    const provider = ssoBtn.getAttribute("data-sso") || "SSO";
    toast(`Enterprise OAuth with ${provider === "github" ? "GitHub" : "Google Workspace"} simulated in mock adapter.`);
    setTimeout(async () => {
      location.href = `${location.pathname}#${routes.chat}`;
      await hydrate();
    }, 600);
    return;
  }

  /* dismiss custom select dropdowns on outside click */
  const customSelect = event.target instanceof Element ? event.target.closest(".settings-custom-select") : null;
  if (!customSelect) {
    document.querySelectorAll(".settings-custom-select.is-open").forEach((el) => {
      el.classList.remove("is-open", "is-open-up");
      el.querySelector(".settings-select-trigger")?.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll(".has-open-select").forEach((el) => {
      el.classList.remove("has-open-select");
    });
  }

  /* dismiss topbar custom dropdowns on outside click */
  const topbarDropdown = event.target instanceof Element ? event.target.closest(".topbar-dropdown") : null;
  if (!topbarDropdown) {
    document.querySelectorAll(".topbar-dropdown.is-open").forEach((el) => {
      el.classList.remove("is-open");
      el.querySelector(".topbar-switcher-btn")?.setAttribute("aria-expanded", "false");
    });
  }

  /* dismiss the contextual composer menu on any outside click */
  const workMenuEl = event.target instanceof Element ? event.target.closest(".work-menu, .chat-plus, .work-chip") : null;
  if (state.workMenu && !workMenuEl) {
    state.workMenu = "";
    render();
  }

  const target = event.target instanceof Element
    ? /** @type {HTMLElement|null} */ (event.target.closest("[data-route],[data-action]") || event.target.closest(".toggle-switch")?.querySelector("[data-action]"))
    : null;
  if (!target) return;
  const route = target.getAttribute("data-route");
  if (route) {
    event.preventDefault();
    state.searchOpen = false;
    state.searchQuery = "";
    state.notificationsOpen = false;
    state.profileOpen = false;
    state.inviteOpen = false;
    state.sidebarOpen = false;
    state.settingsSidebarOpen = false;
    state.chatRailOpen = false;
    navigate(route);
    render();
    loadRouteData();
    return;
  }
  const action = target.getAttribute("data-action");

  if (action === "settings-custom-select-toggle") {
    const parent = target.closest(".settings-custom-select");
    if (parent) {
      const willOpen = !parent.classList.contains("is-open");
      document.querySelectorAll(".settings-custom-select.is-open").forEach((el) => {
        if (el !== parent) {
          el.classList.remove("is-open", "is-open-up");
          el.querySelector(".settings-select-trigger")?.setAttribute("aria-expanded", "false");
        }
      });
      document.querySelectorAll(".has-open-select").forEach((el) => {
        if (!el.contains(parent)) {
          el.classList.remove("has-open-select");
        }
      });

      if (willOpen) {
        // Smart flip upwards if close to bottom of viewport or card container
        const rect = parent.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const openUp = spaceBelow < 260 && spaceAbove > 200;
        parent.classList.toggle("is-open-up", openUp);
        parent.classList.add("is-open");
        target.setAttribute("aria-expanded", "true");

        // Elevate parent row and card stacking context
        const row = parent.closest(".setting-row");
        const card = parent.closest(".settings-card");
        if (row) row.classList.add("has-open-select");
        if (card) card.classList.add("has-open-select");
      } else {
        parent.classList.remove("is-open", "is-open-up");
        target.setAttribute("aria-expanded", "false");
        const row = parent.closest(".setting-row");
        const card = parent.closest(".settings-card");
        if (row) row.classList.remove("has-open-select");
        if (card) card.classList.remove("has-open-select");
      }
    }
    return;
  }
  if (action === "settings-custom-select-pick") {
    const id = target.getAttribute("data-setting-id");
    const val = target.getAttribute("data-value");
    const parent = target.closest(".settings-custom-select");
    if (parent) {
      parent.classList.remove("is-open", "is-open-up");
      parent.querySelector(".settings-select-trigger")?.setAttribute("aria-expanded", "false");
    }
    document.querySelectorAll(".has-open-select").forEach((el) => el.classList.remove("has-open-select"));
    if (id && val !== null) {
      settingsApi.updateSetting({
        id,
        scope: "workspace",
        scopeId: state.workspaceId,
        value: val,
        idempotencyKey: createIdempotencyKey()
      }).then(async () => {
        await loadSettings();
        toast(`Updated ${id}`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Setting update failed"));
    }
    return;
  }
  if (action === "settings-custom-surface-pick") {
    const val = target.getAttribute("data-value");
    const parent = target.closest(".settings-custom-select");
    if (parent) {
      parent.classList.remove("is-open", "is-open-up");
      parent.querySelector(".settings-select-trigger")?.setAttribute("aria-expanded", "false");
    }
    document.querySelectorAll(".has-open-select").forEach((el) => el.classList.remove("has-open-select"));
    if (val) {
      state.defaultLandingSurface = val;
      try { localStorage.setItem("synase_default_surface", val); } catch (_) {}
      toast(`Default landing surface updated.`);
      render();
    }
    return;
  }
  if (action === "settings-custom-timeout-pick") {
    const val = target.getAttribute("data-value");
    const parent = target.closest(".settings-custom-select");
    if (parent) {
      parent.classList.remove("is-open", "is-open-up");
      parent.querySelector(".settings-select-trigger")?.setAttribute("aria-expanded", "false");
    }
    document.querySelectorAll(".has-open-select").forEach((el) => el.classList.remove("has-open-select"));
    if (val) {
      state.sessionTimeoutMinutes = Number(val);
      try { localStorage.setItem("synase_session_timeout", val); } catch (_) {}
      toast(`Session inactivity timeout updated to ${val} min.`);
      render();
    }
    return;
  }

  if (action === "topbar-switcher-toggle") {
    const parent = target.closest(".topbar-dropdown");
    if (parent) {
      const willOpen = !parent.classList.contains("is-open");
      document.querySelectorAll(".topbar-dropdown.is-open").forEach((el) => {
        if (el !== parent) {
          el.classList.remove("is-open");
          el.querySelector(".topbar-switcher-btn")?.setAttribute("aria-expanded", "false");
        }
      });
      parent.classList.toggle("is-open", willOpen);
      target.setAttribute("aria-expanded", willOpen ? "true" : "false");
    }
    return;
  }
  if (action === "topbar-pick-workspace") {
    const wsId = target.getAttribute("data-workspace-id");
    const parent = target.closest(".topbar-dropdown");
    if (parent) {
      parent.classList.remove("is-open");
      parent.querySelector(".topbar-switcher-btn")?.setAttribute("aria-expanded", "false");
    }
    if (wsId && wsId !== state.workspaceId) {
      const hiddenSelect = /** @type {HTMLSelectElement|null} */ (document.querySelector("#workspace-switcher"));
      if (hiddenSelect) hiddenSelect.value = wsId;
      await hydrate(wsId);
      const name = state.workspaces.find((w) => w.id === wsId)?.name || wsId;
      toast(`Switched workspace to ${name}`);
    }
    return;
  }
  if (action === "topbar-pick-project") {
    const prjId = target.getAttribute("data-project-id");
    const parent = target.closest(".topbar-dropdown");
    if (parent) {
      parent.classList.remove("is-open");
      parent.querySelector(".topbar-switcher-btn")?.setAttribute("aria-expanded", "false");
    }
    if (prjId && prjId !== state.projectId) {
      state.projectId = prjId;
      const hiddenSelect = /** @type {HTMLSelectElement|null} */ (document.querySelector("#project-switcher"));
      if (hiddenSelect) hiddenSelect.value = prjId;
      try {
        await hydrateProject(prjId);
      } catch (error) {
        toast(error instanceof Error ? error.message : "Unable to load the project.");
      }
      navigate(`/app/projects/${prjId}/overview`);
      render();
      const name = state.projects.find((p) => p.id === prjId)?.name || prjId;
      toast(`Switched project to ${name}`);
    }
    return;
  }

  /* chrome */
  if (action === "demo-login") {
    location.href = `${location.pathname}#${routes.chat}`;
    hydrate();
    return;
  }
  if (action === "toggle-menu") { state.sidebarOpen = !state.sidebarOpen; render(); }
  if (action === "close-sidebar") { state.sidebarOpen = false; render(); }
  if (action === "toggle-chat-rail") { state.chatRailOpen = !state.chatRailOpen; render(); }
  if (action === "close-chat-rail") { state.chatRailOpen = false; render(); }
  if (action === "search") {
    state.searchOpen = !state.searchOpen;
    if (state.searchOpen) {
      state.searchQuery = "";
      state.notificationsOpen = false;
      state.profileOpen = false;
      state.inviteOpen = false;
    }
    render();
    if (state.searchOpen) {
      setTimeout(() => /** @type {HTMLInputElement|null} */ (document.querySelector("#command-search-input"))?.focus(), 50);
    }
  }
  if (action === "notifications") {
    state.notificationsOpen = !state.notificationsOpen;
    if (state.notificationsOpen) {
      state.searchOpen = false;
      state.profileOpen = false;
      state.inviteOpen = false;
    }
    render();
  }
  if (action === "profile") {
    state.profileOpen = !state.profileOpen;
    if (state.profileOpen) {
      state.searchOpen = false;
      state.notificationsOpen = false;
      state.inviteOpen = false;
    }
    render();
  }
  if (action === "invite") {
    state.inviteOpen = !state.inviteOpen;
    if (state.inviteOpen) {
      state.searchOpen = false;
      state.notificationsOpen = false;
      state.profileOpen = false;
    }
    render();
  }
  if (action === "close-modals") {
    if (event.target === target) {
      state.searchOpen = false;
      state.notificationsOpen = false;
      state.profileOpen = false;
      state.inviteOpen = false;
      render();
    }
  }
  if (action === "close-notifications" || action === "close-profile" || action === "close-invite") {
    state.searchOpen = false;
    state.notificationsOpen = false;
    state.profileOpen = false;
    state.inviteOpen = false;
    render();
  }
  if (action === "select-command-item") {
    state.searchOpen = false;
    state.searchQuery = "";
    render();
  }
  if (action === "dismiss-notification") {
    const notifId = target.getAttribute("data-id");
    if (notifId) {
      state.dismissedNotificationIds = [...(state.dismissedNotificationIds || []), notifId];
      render();
    }
  }
  if (action === "clear-all-notifications") {
    const allIds = [
      ...(state.approvals || []).map((a) => a.id),
      ...(state.findings || []).map((f) => f.id),
      ...(state.workflows || []).map((w) => w.id)
    ];
    state.dismissedNotificationIds = allIds;
    toast("All notifications cleared.");
    render();
  }
  if (action === "copy-invite-link") {
    const input = /** @type {HTMLInputElement|null} */ (document.querySelector("#invite-share-link"));
    if (input) {
      navigator.clipboard?.writeText(input.value);
      toast("Invitation link copied to clipboard.");
    }
  }
  if (action === "sign-out") {
    workspaceApi.logout();
    state.authenticated = false;
    state.user = null;
    state.profileOpen = false;
    navigate("/auth/login");
    toast("Signed out successfully.");
    render();
  }
  if (action === "remove-selected-file") {
    if (state.selectedFile?.previewUrl) {
      try { URL.revokeObjectURL(state.selectedFile.previewUrl); } catch (_) {}
    }
    state.selectedFile = null;
    render();
    toast("Selected file removed.");
  }
  if (action === "archive-project") {
    const pId = target.getAttribute("data-project-id");
    const proj = state.projects.find((p) => p.id === pId);
    if (proj) {
      const newStatus = proj.lifecycleStatus === "archived" ? "active" : "archived";
      proj.lifecycleStatus = newStatus;
      workspaceApi.updateProject(pId, { lifecycleStatus: newStatus }).catch(() => {});
      toast(`Project "${proj.name}" is now ${newStatus}.`);
      render();
    }
  }

  if (action === "settings-export-section-trigger") {
    const secId = target.getAttribute("data-section-id") || state.settingsSection;
    const exportData = {
      section: secId,
      workspaceId: state.workspaceId,
      projectId: state.projectId,
      exportedAt: new Date().toISOString(),
      effectiveSettings: state.effectiveSettings,
      agentPolicy: state.agentPolicy
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `synase-settings-${secId}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(`Exported configuration for "${secId}".`);
  }

  /* workspace */
  if (action === "toggle-repo-form") document.querySelector("#repo-form-panel")?.classList.toggle("hidden-panel");
  if (action === "close-repo-detail") { state.repositoryDetailId = ""; state.repositorySnapshots = []; state.repositoryTree = []; render(); }
  if (action === "input-tab") { state.inputTab = target.getAttribute("data-tab") || "file"; render(); }
  if (action === "analysis-tab") { state.analysisTab = target.getAttribute("data-tab") || "conversation"; render(); }
  if (action === "toggle-conversation-form") document.querySelector("#new-conversation-form")?.classList.toggle("hidden-panel");
  if (action === "select-conversation") {
    const conversationId = target.getAttribute("data-conversation-id");
    workspaceApi.listMessages(state.projectId, conversationId).then((messages) => {
      state.conversationId = conversationId;
      state.messages = messages.data;
      render();
    });
  }
  if (action === "cancel-request") {
    workspaceApi.cancelAnalysisRequest(state.projectId, target.getAttribute("data-request-id")).then(async () => {
      state.analysisRequests = (await workspaceApi.listAnalysisRequests(state.projectId)).data;
      toast("Analysis request cancelled by the mock adapter.");
      render();
    }).catch((error) => toast(error instanceof Error ? error.message : "Cancellation failed."));
  }

  /* workflow execution */
  if (action === "select-workflow") {
    const workflowId = target.getAttribute("data-workflow-id");
    Promise.all([
      workspaceApi.listWorkflowTasks(state.projectId, workflowId),
      workspaceApi.listWorkflowEvents(state.projectId, workflowId)
    ]).then(([tasks, events]) => {
      state.workflowId = workflowId;
      state.workflowTasks = tasks.data;
      state.workflowEvents = normalizeWorkflowEvents(events.data);
      state.streamState = "idle";
      render();
    });
  }
  if (action === "toggle-stream") {
    state.streamState = state.streamState === "open" ? "closed" : state.streamState === "closed" ? "reconnecting" : "open";
    if (state.streamState === "reconnecting") {
      Promise.all([
        workspaceApi.getWorkflow(state.projectId, state.workflowId),
        workspaceApi.listWorkflowEvents(state.projectId, state.workflowId)
      ]).then(([workflow, events]) => {
        state.workflows = state.workflows.map((item) => item.id === workflow.data.id ? workflow.data : item);
        state.workflowEvents = normalizeWorkflowEvents(events.data);
        state.streamState = "open";
        toast("Mock reconnect refetched the authoritative snapshot.");
        render();
      });
    } else render();
  }
  if (action === "next-mock-event") {
    state.streamState = "open";
    workspaceApi.nextMockWorkflowEvent(state.projectId, state.workflowId).then(async (result) => {
      if (!result.data.event) { toast("No further mock events."); return; }
      state.workflowEvents = normalizeWorkflowEvents([...state.workflowEvents, result.data.event]);
      state.workflows = state.workflows.map((item) => item.id === result.data.workflow.id ? result.data.workflow : item);
      if (result.data.terminal) {
        const snapshot = await workspaceApi.getWorkflow(state.projectId, state.workflowId);
        state.workflows = state.workflows.map((item) => item.id === snapshot.data.id ? snapshot.data : item);
        state.streamState = "closed";
        toast("Terminal mock event received; authoritative snapshot refetched.");
      }
      render();
    });
  }
  if (action === "workflow-control") {
    workspaceApi.controlWorkflow(state.projectId, state.workflowId, target.getAttribute("data-control")).then((result) => {
      state.workflows = state.workflows.map((item) => item.id === result.data.id ? result.data : item);
      toast(`Workflow ${result.data.status} in the mock adapter.`);
      render();
    }).catch((error) => toast(error instanceof Error ? error.message : "Workflow control failed."));
  }

  /* mcp */
  if (action === "select-mcp-request") {
    const requestId = target.getAttribute("data-request-id");
    mcpApi.getTrace(requestId).then((trace) => {
      state.mcpRequestId = requestId;
      state.mcpTrace = trace.data;
      render();
    });
  }
  if (action === "server-health") {
    mcpApi.checkServerHealth(target.getAttribute("data-server-id")).then(async (result) => {
      state.mcpServers = (await mcpApi.listServers()).data;
      toast(`Mock health check: ${result.data.healthStatus}. No server was contacted.`);
      render();
    });
  }
  if (action === "discover-directory") {
    mcpApi.discoverDirectory(target.getAttribute("data-directory-id"), { idempotencyKey: createIdempotencyKey() }).then((result) => {
      toast(`Mock discovery completed with ${result.data.resultsCount} fixture results.`);
    });
  }

  /* product */
  if (action === "product-tab" || action === "product-section") {
    const sec = target.getAttribute("data-section") || target.getAttribute("data-tab") || "overview";
    state.productSection = sec;
    state.productTab = sec;
    render();
  }
  if (action === "product-select-requirement") {
    state.productSelectedRequirementId = target.getAttribute("data-req-id") || "";
    render();
  }
  if (action === "product-close-requirement-drawer") {
    state.productSelectedRequirementId = "";
    render();
  }
  if (action === "product-update-req-status") {
    const reqId = target.getAttribute("data-req-id");
    const newStatus = target.getAttribute("data-status");
    if (reqId && newStatus) {
      productApi.updateRequirement(state.projectId, reqId, { status: newStatus }, { idempotencyKey: createIdempotencyKey() }).then(async () => {
        state.requirements = (await productApi.listRequirements(state.projectId)).data;
        toast(`Requirement ${reqId} updated to ${newStatus}.`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Update failed."));
    }
  }
  if (action === "product-delete-req") {
    const reqId = target.getAttribute("data-req-id");
    if (reqId) {
      productApi.deleteRequirement(state.projectId, reqId, { idempotencyKey: createIdempotencyKey() }).then(async () => {
        state.requirements = (await productApi.listRequirements(state.projectId)).data;
        if (state.productSelectedRequirementId === reqId) state.productSelectedRequirementId = "";
        toast(`Requirement ${reqId} deleted.`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Deletion failed."));
    }
  }
  if (action === "product-move-rank") {
    const featId = target.getAttribute("data-feat-id");
    const dir = target.getAttribute("data-dir");
    const feats = [...state.productFeatures].sort((a, b) => a.priorityRank - b.priorityRank);
    const idx = feats.findIndex((f) => f.id === featId);
    if (idx !== -1 && ((dir === "up" && idx > 0) || (dir === "down" && idx < feats.length - 1))) {
      const targetIdx = dir === "up" ? idx - 1 : idx + 1;
      const temp = feats[idx];
      feats[idx] = feats[targetIdx];
      feats[targetIdx] = temp;
      const orderedIds = feats.map((f) => f.id);
      productApi.reprioritizeFeatures(state.projectId, orderedIds, { idempotencyKey: createIdempotencyKey() }).then(async (result) => {
        state.productFeatures = result.data;
        toast(`Feature #${featId} moved ${dir}.`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Re-ranking failed."));
    }
  }
  if (action === "product-reprioritize-auto") {
    const sorted = [...state.productFeatures].sort((a, b) => {
      const ratioA = a.businessValue / Math.max(a.effort, 1);
      const ratioB = b.businessValue / Math.max(b.effort, 1);
      return ratioB - ratioA;
    });
    const orderedIds = sorted.map((f) => f.id);
    productApi.reprioritizeFeatures(state.projectId, orderedIds, { idempotencyKey: createIdempotencyKey() }).then(async (result) => {
      state.productFeatures = result.data;
      toast("Features automatically ranked by Business Value / Effort ratio.");
      render();
    }).catch((err) => toast(err instanceof Error ? err.message : "Auto-ranking failed."));
  }
  if (action === "product-modal") {
    state.productActiveModal = target.getAttribute("data-modal") || "";
    render();
  }
  if (action === "close-modal") {
    state.productActiveModal = "";
    render();
  }
  if (action === "product-feature-delete") {
    const featId = target.getAttribute("data-feat-id");
    if (featId) {
      productApi.deleteFeature(state.projectId, featId, { idempotencyKey: createIdempotencyKey() }).then(async () => {
        state.productFeatures = (await productApi.listProductFeatures(state.projectId)).data;
        toast(`Feature ${featId} removed.`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Feature deletion failed."));
    }
  }
  if (action === "product-delete-roadmap") {
    const roadId = target.getAttribute("data-roadmap-id");
    if (roadId) {
      productApi.deleteRoadmapItem(state.projectId, roadId, { idempotencyKey: createIdempotencyKey() }).then(async () => {
        state.roadmapItems = (await productApi.listRoadmapItems(state.projectId)).data;
        toast(`Milestone ${roadId} removed.`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Milestone deletion failed."));
    }
  }
  if (action === "product-mock") {
    const act = target.getAttribute("data-product-action") || "overview";
    productApi.runProductIntelligenceAction(state.projectId, act, { idempotencyKey: createIdempotencyKey() }).then(async (result) => {
      toast(`[Receipt ${result.data.receiptId}] ${result.data.details}. Status: ${result.data.status}`);
      render();
    }).catch((err) => {
      toast(err instanceof Error ? err.message : "Analysis run failed.");
    });
  }

  /* devops */
  if (action === "devops-tab") { state.devopsTab = target.getAttribute("data-tab") || "overview"; render(); }
  if (action === "devops-mock") {
    devopsApi.runDevOpsMock(state.projectId, target.getAttribute("data-devops-domain"), { idempotencyKey: createIdempotencyKey() }).then((result) => {
      toast(`Mock ${result.data.domain} analysis completed. Executed actions: 0.`);
    });
  }

  /* context */
  if (action === "context-mock") {
    contextApi.runContextMock(state.projectId, target.getAttribute("data-context-action"), { idempotencyKey: createIdempotencyKey() }).then((result) => {
      toast(`Mock ${result.data.action.replaceAll("_", " ")} completed. No backend store was contacted.`);
    });
  }

  /* decision dashboard (was src/phase12.js) */
  if (action === "dashboard-retry") loadDashboard();

  /* outputs */
  if (action === "generate-report") {
    outputsApi.generateReport(state.projectId, "final_decision_summary", { idempotencyKey: createIdempotencyKey() }).then((result)=>toast(`Queued mock receipt ${result.data.workflowId}. No report was generated.`));
  }
  if (action === "export-report") {
    outputsApi.exportReport(state.projectId, target.getAttribute("data-report-id"), "pdf", { idempotencyKey: createIdempotencyKey() }).then(()=>toast("Mock export receipt created. No binary or download URL exists."));
  }
  if (action === "publish-report") {
    outputsApi.publishReport(state.projectId, target.getAttribute("data-report-id"), { idempotencyKey: createIdempotencyKey() }).then(()=>toast("Mock publication receipt created. Nothing was published.")).catch((error)=>toast(error instanceof Error ? error.message : "Publication failed."));
  }
  if (action === "select-approval") {
    const approvalId = target.getAttribute("data-approval-id");
    outputsApi.getApproval(state.projectId, approvalId).then((result)=>{ state.approvalId = approvalId; state.approvalDetail = result.data; render(); });
  }
  if (action === "cancel-approval") {
    outputsApi.cancelApproval(state.projectId, target.getAttribute("data-approval-id"), { idempotencyKey: createIdempotencyKey() }).then(async (result)=>{
      state.approvals = (await outputsApi.listApprovals(state.projectId)).data; state.approvalDetail = result.data; toast("Approval request cancelled. No downstream action executed."); render();
    }).catch((error)=>toast(error instanceof Error ? error.message : "Cancellation failed."));
  }

  /* repository + inputs */
  if (action === "repo-detail") {
    const repositoryId = target.getAttribute("data-repository-id");
    Promise.all([
      workspaceApi.listRepositorySnapshots(repositoryId),
      workspaceApi.getRepositoryTree(repositoryId)
    ]).then(([snapshots, tree]) => {
      state.repositoryDetailId = repositoryId;
      state.repositorySnapshots = snapshots.data;
      state.repositoryTree = tree.data;
      render();
    }).catch((error) => toast(error instanceof Error ? error.message : "Repository detail failed."));
  }
  if (action === "repo-sync") {
    const repositoryId = target.getAttribute("data-repository-id");
    workspaceApi.syncRepository(state.projectId, repositoryId).then(async () => {
      state.repositories = (await workspaceApi.listRepositories(state.projectId)).data;
      toast("Mock repository sync completed. No provider was contacted.");
      render();
    }).catch((error) => toast(error instanceof Error ? error.message : "Sync failed."));
  }
  if (action === "advance-asset") {
    workspaceApi.advanceAssetDemo(state.projectId, target.getAttribute("data-asset-id")).then(async () => {
      state.assets = (await workspaceApi.listAssets(state.projectId)).data;
      toast("Advanced one explicit mock processing state.");
      render();
    });
  }
  if (action === "delete-asset") {
    workspaceApi.deleteAsset(state.projectId, target.getAttribute("data-asset-id")).then(async () => {
      state.assets = (await workspaceApi.listAssets(state.projectId)).data;
      toast("Input removed from the mock inventory.");
      render();
    });
  }

  /* integrations (was src/phase11.js) */
  if (["integration-connect", "integration-disconnect", "integration-health", "integration-sync"].includes(action)) {
    mutateIntegration(action.replace("integration-", ""), target.getAttribute("data-id") || "");
  }
  if (action === "integration-retry") loadIntegrations();
  if (action === "audit-detail") {
    phase11Api.getAuditEvent(state.projectId, target.getAttribute("data-id") || "").then((result) => {
      state.auditDetail = result.data;
      render();
    }).catch((error) => { state.integrationError = error instanceof Error ? error.message : "Action failed"; render(); });
  }
  if (action === "audit-close") { state.auditDetail = null; render(); }

  /* settings control plane */
  if (action === "settings-navigate") {
    const sec = target.getAttribute("data-section");
    if (sec) {
      state.settingsSection = sec;
      state.settingsSidebarOpen = false;
      navigate(`/app/settings/${sec}`);
      render();
    }
  }
  if (action === "settings-toggle-sidebar") {
    state.settingsSidebarOpen = !state.settingsSidebarOpen;
    render();
  }
  if (action === "settings-close-sidebar") {
    state.settingsSidebarOpen = false;
    render();
  }
  if (action === "settings-search-clear") {
    state.settingsSearchQuery = "";
    render();
  }
  if (action === "settings-toggle-change") {
    const id = target.getAttribute("data-setting-id");
    const current = state.effectiveSettings?.[id];
    const nextVal = target instanceof HTMLInputElement ? target.checked : !current?.value;
    if (id) {
      settingsApi.updateSetting({
        id,
        scope: "workspace",
        scopeId: state.workspaceId,
        value: nextVal,
        idempotencyKey: createIdempotencyKey()
      }).then(async () => {
        await loadSettings();
        toast(`Updated ${id} to ${nextVal}`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Setting update failed"));
    }
  }
  if (action === "settings-open-create-key-modal") {
    state.settingsActiveModal = { type: "create-api-key" };
    render();
  }
  if (action === "settings-create-key-submit") {
    const nameInput = /** @type {HTMLInputElement|null} */ (document.querySelector("#new-key-name"));
    const expiryInput = /** @type {HTMLSelectElement|null} */ (document.querySelector("#new-key-expiry"));
    const scopes = Array.from(document.querySelectorAll("#settings-create-key-form input[name='scope']:checked"))
      .map((el) => /** @type {HTMLInputElement} */ (el).value);
    const name = nameInput?.value.trim() || "API Key";
    const expiresInDays = Number(expiryInput?.value || 90);
    settingsApi.createApiKey({
      workspaceId: state.workspaceId,
      name,
      scopes: scopes.length ? scopes : ["read"],
      expiresInDays,
      idempotencyKey: createIdempotencyKey()
    }).then(async (res) => {
      state.apiKeys = (await settingsApi.listApiKeys({ workspaceId: state.workspaceId })).data || [];
      state.settingsActiveModal = {
        type: "api-key-revealed",
        data: {
          name,
          oneTimeSecret: res.data.oneTimeSecret,
          maskedPrefix: res.data.maskedPrefix
        }
      };
      render();
    }).catch((err) => toast(err instanceof Error ? err.message : "Key generation failed"));
  }
  if (action === "settings-copy-secret") {
    const secret = target.getAttribute("data-secret") || "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(secret).catch(() => {});
    }
    toast("Secret copied to clipboard!");
  }
  if (action === "settings-revoke-key") {
    const keyId = target.getAttribute("data-key-id") || "";
    settingsApi.revokeApiKey(keyId, { idempotencyKey: createIdempotencyKey() }).then(async () => {
      state.apiKeys = (await settingsApi.listApiKeys({ workspaceId: state.workspaceId })).data || [];
      toast("API Key revoked.");
      render();
    }).catch((err) => toast(err instanceof Error ? err.message : "Revocation failed"));
  }
  if (action === "settings-open-connector-modal") {
    const connId = target.getAttribute("data-connector-id");
    const conn = (state.settingsConnectors || []).find((c) => c.id === connId);
    state.settingsActiveModal = { type: "connect-connector", data: conn };
    render();
  }
  if (action === "settings-connector-confirm-connect") {
    const connId = target.getAttribute("data-connector-id") || "";
    settingsApi.updateConnector(connId, { status: "connected" }, { idempotencyKey: createIdempotencyKey() }).then(async () => {
      state.settingsConnectors = (await settingsApi.listConnectors({ workspaceId: state.workspaceId })).data || [];
      state.settingsActiveModal = null;
      toast("Connector authorized and connected.");
      render();
    }).catch((err) => toast(err instanceof Error ? err.message : "Connection failed"));
  }
  if (action === "settings-connector-toggle") {
    const connId = target.getAttribute("data-connector-id") || "";
    const nextStatus = target.getAttribute("data-next-status") || "disconnected";
    settingsApi.updateConnector(connId, { status: nextStatus }, { idempotencyKey: createIdempotencyKey() }).then(async () => {
      state.settingsConnectors = (await settingsApi.listConnectors({ workspaceId: state.workspaceId })).data || [];
      toast(`Connector updated to ${nextStatus}.`);
      render();
    }).catch((err) => toast(err instanceof Error ? err.message : "Connector toggle failed"));
  }
  if (action === "settings-automation-toggle") {
    const autoId = target.getAttribute("data-auto-id") || "";
    const nextStatus = target.getAttribute("data-next-status") || "active";
    settingsApi.updateAutomation(autoId, { status: nextStatus }, { idempotencyKey: createIdempotencyKey() }).then(async () => {
      state.settingsAutomations = (await settingsApi.listAutomations({ workspaceId: state.workspaceId })).data || [];
      toast(`Automation is now ${nextStatus}.`);
      render();
    }).catch((err) => toast(err instanceof Error ? err.message : "Automation update failed"));
  }
  if (action === "settings-open-export-modal") {
    state.settingsActiveModal = { type: "export-data" };
    render();
  }
  if (action === "settings-export-confirm") {
    const anonymize = /** @type {HTMLInputElement|null} */ (document.querySelector("#export-anonymize"))?.checked ?? true;
    settingsApi.exportWorkspaceData(state.workspaceId, { anonymize }).then((res) => {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `synase-workspace-${state.workspaceId}-export.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      state.settingsActiveModal = null;
      toast("Export snapshot generated and downloaded.");
      render();
    }).catch((err) => toast(err instanceof Error ? err.message : "Export failed"));
  }
  if (action === "settings-open-import-modal") {
    state.settingsActiveModal = { type: "import-data" };
    render();
  }
  if (action === "settings-import-validate") {
    const payloadEl = /** @type {HTMLTextAreaElement|null} */ (document.querySelector("#import-json-payload"));
    const raw = payloadEl?.value.trim() || "{}";
    try {
      const parsed = JSON.parse(raw);
      settingsApi.validateImportData(parsed).then((res) => {
        const resEl = document.querySelector("#import-validation-result");
        if (resEl) {
          resEl.innerHTML = `<div class="settings-alert-info">Schema Valid: ${res.data.valid} · Version ${res.data.schemaVersion} · ${res.data.settingsCount || 0} settings detected.</div>`;
        }
        toast("Import snapshot validated.");
      }).catch((err) => {
        const resEl = document.querySelector("#import-validation-result");
        if (resEl) resEl.innerHTML = `<div class="settings-alert-danger">${escapeHtml(err.message)}</div>`;
      });
    } catch (err) {
      const resEl = document.querySelector("#import-validation-result");
      if (resEl) resEl.innerHTML = `<div class="settings-alert-danger">${escapeHtml(err instanceof Error ? err.message : "Invalid JSON")}</div>`;
    }
  }
  if (action === "settings-open-reset-modal") {
    state.settingsActiveModal = { type: "confirm-reset" };
    render();
  }
  if (action === "settings-reset-confirm") {
    settingsApi.resetSettings({ workspaceId: state.workspaceId }).then(async () => {
      await loadSettings();
      state.settingsActiveModal = null;
      toast("Settings restored to system defaults.");
      render();
    }).catch((err) => toast(err instanceof Error ? err.message : "Reset failed"));
  }
  if (action === "settings-inspect-scope") {
    const scope = target.getAttribute("data-scope") || "workspace";
    const rank = Number(target.getAttribute("data-rank") || 1);
    const context = target.getAttribute("data-ctx") || scope;
    state.settingsInspectedScope = scope;
    state.settingsActiveModal = { type: "inspect-scope", data: { scope, rank, context } };
    render();
  }
  if (action === "settings-reset-section-trigger") {
    const section = target.getAttribute("data-section-id") || target.getAttribute("data-section") || state.settingsSection || "general";
    state.settingsActiveModal = { type: "confirm-reset-section", data: { sectionId: section } };
    render();
  }
  if (action === "settings-reset-section-confirm") {
    const section = target.getAttribute("data-section-id") || target.getAttribute("data-section") || state.settingsSection || "general";
    settingsApi.resetSettings({ workspaceId: state.workspaceId, section }).then(async () => {
      await loadSettings();
      state.settingsActiveModal = null;
      toast(`Section "${section}" restored to defaults.`);
      render();
    }).catch((err) => toast(err instanceof Error ? err.message : "Reset section failed"));
  }
  if (action === "settings-set-theme") {
    const theme = target.getAttribute("data-theme") || "dark";
    setTheme(theme);
    toast(`Theme preset set to ${theme}.`);
    render();
  }
  if (action === "settings-cmd-palette-toggle") {
    state.commandPaletteEnabled = !state.commandPaletteEnabled;
    try { localStorage.setItem("synase_cmd_palette_enabled", String(state.commandPaletteEnabled)); } catch (_) {}
    toast(`Command Palette shortcut ${state.commandPaletteEnabled ? "enabled (⌘K)" : "disabled"}.`);
    render();
  }
  if (action === "settings-ping-provider") {
    const providerId = target.getAttribute("data-provider-id") || "gateway";
    toast(`Gateway Ping (${providerId}): 32ms · Latency nominal · Status: active`);
  }
  if (action === "settings-compact-memory") {
    toast("ChromaDB vector collection compacted. Fragmented segments merged.");
  }
  if (action === "settings-purge-memory") {
    toast("Vector cache pruned: 0 stale embeddings removed. Index verified.");
  }
  if (action === "settings-connector-sync") {
    const connId = target.getAttribute("data-connector-id");
    toast(`Triggered mock delta sync for ${connId || "connector"}. Status: Completed.`);
  }
  if (action === "settings-test-webhook") {
    const urlEl = /** @type {HTMLInputElement|null} */ (document.querySelector("#settings-webhook-url"));
    const url = urlEl?.value.trim() || "https://api.synase.internal/webhooks/mock";
    toast(`Dispatched mock ping payload to ${url}. Result: 200 OK.`);
  }
  if (action === "settings-run-automation") {
    const autoId = target.getAttribute("data-auto-id");
    toast(`Executed ad-hoc run for ${autoId || "automation"}. Execution queue receipt: run_${Date.now()}`);
  }
  if (action === "settings-vault-pick-file") {
    /** @type {HTMLInputElement|null} */ (document.querySelector("#vault-file-input"))?.click();
  }
  if (action === "remove-vault-file") {
    state.vaultSelectedFile = null;
    render();
  }
  if (action === "stage-vault-document") {
    if (state.vaultSelectedFile) {
      state.vaultStagedDocuments = [
        {
          id: `doc_${Date.now()}`,
          name: state.vaultSelectedFile.name,
          size: state.vaultSelectedFile.size,
          type: state.vaultSelectedFile.type,
          stagedAt: new Date().toLocaleTimeString(),
          status: "client_staged"
        },
        ...(state.vaultStagedDocuments || [])
      ];
      state.vaultSelectedFile = null;
      toast("Document staged in local knowledge vault.");
      render();
    }
  }
  if (action === "settings-vault-remove-doc") {
    const docId = target.getAttribute("data-doc-id");
    state.vaultStagedDocuments = (state.vaultStagedDocuments || []).filter((d) => d.id !== docId);
    toast("Document removed from local vault stage.");
    render();
  }
  if (action === "settings-modal-close" || action === "settings-modal-backdrop-click") {
    state.settingsActiveModal = null;
    render();
  }

  /* Chat & Work owns its own actions */
  if (work.handleWorkAction(action, target)) return;
});

/**
 * @param {string} action
 * @param {string} id
 */
async function mutateIntegration(action, id) {
  const options = { idempotencyKey: createPhase11IdempotencyKey() };
  const method = {
    connect: "connectIntegration",
    disconnect: "disconnectIntegration",
    health: "checkIntegrationHealth",
    sync: "syncIntegration"
  }[action];
  try {
    state.integrationReceipt = (await phase11Api[method](state.projectId, id, options)).data;
  } catch (error) {
    state.integrationError = error instanceof Error ? error.message : "Action failed";
  }
  render();
}

document.addEventListener("change", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
  if (target.id === "work-file-input" && target instanceof HTMLInputElement && target.files?.length) {
    const newFiles = Array.from(target.files).map((file) => {
      const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
      return {
        id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: file.type.startsWith("image/") ? "image" : "file",
        name: file.name,
        size: sizeStr
      };
    });
    state.workAttachments = [...(state.workAttachments || []), ...newFiles];
    target.value = "";
    toast(`Attached ${newFiles.length} file source${newFiles.length === 1 ? "" : "s"}.`);
    render();
    return;
  }
  if (target.getAttribute("data-action") === "settings-switch-section") {
    state.settingsSection = target.value;
    state.settingsSidebarOpen = false;
    navigate(`/app/settings/${target.value}`);
    render();
    return;
  }
  if (target.id === "workspace-switcher") await hydrate(target.value);
  if (target.id === "project-switcher") {
    state.projectId = target.value;
    try {
      await hydrateProject(target.value);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to load the project.");
    }
    navigate(`/app/projects/${target.value}/overview`);
    render();
  }
  if (target.id === "project-search" || target.id === "project-status") filterProjects();
  if (target.id === "product-status-filter") {
    state.productFilterStatus = target.value;
    render();
  }
  if (target.id === "product-priority-filter") {
    state.productFilterPriority = target.value;
    render();
  }
  if (target.id === "product-provenance-filter") {
    state.productFilterProvenance = target.value;
    render();
  }
  if (target.getAttribute("data-action") === "product-update-roadmap-status") {
    const roadId = target.getAttribute("data-roadmap-id");
    const newStatus = target.value;
    if (roadId && newStatus) {
      productApi.updateRoadmapItem(state.projectId, roadId, { status: newStatus }, { idempotencyKey: createIdempotencyKey() }).then(async () => {
        state.roadmapItems = (await productApi.listRoadmapItems(state.projectId)).data;
        toast(`Milestone ${roadId} updated to ${newStatus}.`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Update failed."));
    }
  }
  if (target.getAttribute("data-action") === "settings-select-change") {
    const id = target.getAttribute("data-setting-id");
    const val = target.value;
    if (id) {
      settingsApi.updateSetting({
        id,
        scope: "workspace",
        scopeId: state.workspaceId,
        value: val,
        idempotencyKey: createIdempotencyKey()
      }).then(async () => {
        await loadSettings();
        toast(`Updated ${id}`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Update failed"));
    }
  }
  if (target.getAttribute("data-action") === "settings-input-change") {
    const id = target.getAttribute("data-setting-id");
    const val = target.type === "number" ? Number(target.value) : target.value;
    if (id) {
      if (id === "general.profile_name" && state.user) {
        state.user.name = String(val);
        state.user.displayName = String(val);
        try { localStorage.setItem("synase_user_display_name", String(val)); } catch (_) {}
      }
      if (id === "general.timezone") {
        state.timezone = String(val);
        try { localStorage.setItem("synase_timezone", String(val)); } catch (_) {}
      }
      settingsApi.updateSetting({
        id,
        scope: "workspace",
        scopeId: state.workspaceId,
        value: val,
        idempotencyKey: createIdempotencyKey()
      }).then(async () => {
        await loadSettings();
        toast(`Updated ${id}`);
        render();
      }).catch((err) => toast(err instanceof Error ? err.message : "Update failed"));
    }
  }
  if (target.getAttribute("data-action") === "settings-default-surface-change" && target instanceof HTMLSelectElement) {
    state.defaultLandingSurface = target.value;
    try { localStorage.setItem("synase_default_surface", target.value); } catch (_) {}
    toast(`Default landing surface updated to ${target.value}.`);
  }
  if (target.getAttribute("data-action") === "settings-session-timeout-change" && target instanceof HTMLSelectElement) {
    state.sessionTimeoutMinutes = Number(target.value);
    try { localStorage.setItem("synase_session_timeout", target.value); } catch (_) {}
    toast(`Session inactivity timeout updated to ${target.value} min.`);
  }
  if (target.id === "vault-file-input" && target instanceof HTMLInputElement && target.files?.[0]) {
    const file = target.files[0];
    if (file.size > 25 * 1024 * 1024) {
      toast("File exceeds 25 MB limit for local staging.");
      return;
    }
    state.vaultSelectedFile = {
      file,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream"
    };
    render();
  }
  if (target.id === "import-json-file" && target instanceof HTMLInputElement && target.files?.[0]) {
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || "");
      const textarea = /** @type {HTMLTextAreaElement|null} */ (document.querySelector("#import-json-payload"));
      if (textarea) textarea.value = text;
      toast(`Loaded ${file.name} into import payload.`);
    };
    reader.readAsText(file);
  }
  if (target.id === "asset-status-filter" && target instanceof HTMLSelectElement) {
    state.assetStatusFilter = target.value;
    render();
  }
  if (target.id === "asset-file" && target instanceof HTMLInputElement && target.files?.[0]) {
    const file = target.files[0];
    const error = file.size > 50 * 1024 * 1024 ? "File exceeds 50 MB mock limit." : "";
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
    state.selectedFile = {
      file,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      previewUrl,
      error
    };
    render();
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.id === "project-search") filterProjects();
  if (target instanceof HTMLInputElement && target.id === "product-search-input") {
    state.productSearchQuery = target.value;
    render();
  }
  if (target instanceof HTMLInputElement && target.getAttribute("data-action") === "settings-search-input") {
    state.settingsSearchQuery = target.value;
    const cursor = target.selectionStart;
    render();
    const searchInput = document.querySelector(".settings-search-input");
    if (searchInput instanceof HTMLInputElement) {
      searchInput.focus();
      if (cursor !== null) searchInput.setSelectionRange(cursor, cursor);
    }
  }
  if (target instanceof HTMLInputElement && target.id === "command-search-input") {
    state.searchQuery = target.value;
    const cursor = target.selectionStart;
    render();
    const searchInput = document.querySelector("#command-search-input");
    if (searchInput instanceof HTMLInputElement) {
      searchInput.focus();
      searchInput.setSelectionRange(cursor, cursor);
    }
  }
  if (target instanceof HTMLInputElement && target.id === "asset-search-input") {
    state.assetSearchQuery = target.value;
    const cursor = target.selectionStart;
    render();
    const assetSearch = document.querySelector("#asset-search-input");
    if (assetSearch instanceof HTMLInputElement) {
      assetSearch.focus();
      assetSearch.setSelectionRange(cursor, cursor);
    }
  }
  /* the composer is uncontrolled between renders, so mirror it into state
     without re-rendering on every keystroke */
  if (target instanceof HTMLInputElement && target.id === "work-input") {
    state.workComposer = target.value;
  }
});

document.addEventListener("dragover", (event) => {
  const dropzone = event.target instanceof Element ? event.target.closest("#asset-dropzone, #vault-dropzone, .settings-vault-dropzone, .dropzone") : null;
  if (dropzone) {
    event.preventDefault();
    dropzone.classList.add("dragover");
  }
});

document.addEventListener("dragleave", (event) => {
  const dropzone = event.target instanceof Element ? event.target.closest("#asset-dropzone, #vault-dropzone, .settings-vault-dropzone, .dropzone") : null;
  if (dropzone) {
    dropzone.classList.remove("dragover");
  }
});

document.addEventListener("drop", (event) => {
  const dropzone = event.target instanceof Element ? event.target.closest("#asset-dropzone, #vault-dropzone, .settings-vault-dropzone, .dropzone") : null;
  if (dropzone) {
    event.preventDefault();
    dropzone.classList.remove("dragover");
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    if (dropzone.id === "vault-dropzone" || dropzone.classList.contains("settings-vault-dropzone")) {
      if (file.size > 25 * 1024 * 1024) {
        toast("File exceeds 25 MB limit for local staging.");
        return;
      }
      state.vaultSelectedFile = {
        file,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream"
      };
      toast(`File "${file.name}" ready to stage in vault.`);
      render();
      return;
    }

    const error = file.size > 50 * 1024 * 1024 ? "File exceeds 50 MB mock limit." : "";
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
    state.selectedFile = {
      file,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      previewUrl,
      error
    };
    render();
  }
});

function filterProjects() {
  const search = /** @type {HTMLInputElement|null} */ (document.querySelector("#project-search"))?.value.toLowerCase() || "";
  const lifecycle = /** @type {HTMLSelectElement|null} */ (document.querySelector("#project-status"))?.value || "";
  const filtered = state.projects.filter((project) =>
    (!search || `${project.name} ${project.description}`.toLowerCase().includes(search)) &&
    (!lifecycle || project.lifecycleStatus === lifecycle)
  );
  const results = document.querySelector("#project-results");
  if (results) results.innerHTML = projectRows(filtered);
}

document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;

  /* Chat & Work composer */
  if (form.id === "work-composer-form") {
    event.preventDefault();
    await work.sendWorkMessage();
    work.focusWorkInput();
    return;
  }

  /* integrations filters (was src/phase11.js) */
  if (form.id === "integration-activity-filter" || form.id === "integration-audit-filter") {
    event.preventDefault();
    await loadIntegrations(Object.fromEntries(new FormData(form)));
    return;
  }

  event.preventDefault();

  /* Product Intelligence forms */
  if (form.id === "product-create-requirement-form") {
    const raw = Object.fromEntries(new FormData(form));
    try {
      await productApi.createRequirement(
        state.projectId,
        {
          title: String(raw.title || ""),
          type: /** @type {any} */ (raw.type || "functional"),
          priority: /** @type {any} */ (raw.priority || "high"),
          rationale: String(raw.rationale || ""),
          evidence: raw.evidence ? [String(raw.evidence)] : [],
          architectureImpact: String(raw.architectureImpact || "")
        },
        { idempotencyKey: createIdempotencyKey() }
      );
      state.requirements = (await productApi.listRequirements(state.projectId)).data;
      state.productActiveModal = "";
      toast("Requirement created successfully.");
      render();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to create requirement.");
    }
    return;
  }
  if (form.id === "product-import-requirements-form") {
    const raw = Object.fromEntries(new FormData(form));
    try {
      const content = String(raw.content || "").trim();
      let items = [];
      if (content.startsWith("[") || content.startsWith("{")) {
        const parsed = JSON.parse(content);
        items = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        items = content.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => ({
          title: line,
          type: "functional",
          priority: "medium",
          provenance: "confirmed"
        }));
      }
      const res = await productApi.importRequirements(state.projectId, items, { idempotencyKey: createIdempotencyKey() });
      state.requirements = (await productApi.listRequirements(state.projectId)).data;
      state.productActiveModal = "";
      toast(`Successfully imported ${res.meta?.importedCount || items.length} requirements.`);
      render();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to import requirements.");
    }
    return;
  }
  if (form.id === "product-create-feature-form") {
    const raw = Object.fromEntries(new FormData(form));
    try {
      await productApi.createFeature(
        state.projectId,
        {
          title: String(raw.title || ""),
          businessValue: Number(raw.businessValue || 5),
          impact: Number(raw.impact || 5),
          effort: Number(raw.effort || 5),
          risk: Number(raw.risk || 5),
          rationale: String(raw.rationale || "")
        },
        { idempotencyKey: createIdempotencyKey() }
      );
      state.productFeatures = (await productApi.listProductFeatures(state.projectId)).data;
      state.productActiveModal = "";
      toast("Candidate feature added.");
      render();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to create feature.");
    }
    return;
  }
  if (form.id === "product-create-roadmap-form") {
    const raw = Object.fromEntries(new FormData(form));
    try {
      const deps = String(raw.dependencies || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await productApi.createRoadmapItem(
        state.projectId,
        {
          milestone: String(raw.milestone || ""),
          release: String(raw.release || "R-Next"),
          status: /** @type {any} */ (raw.status || "planned"),
          startDate: String(raw.startDate || ""),
          endDate: String(raw.endDate || ""),
          dependencies: deps
        },
        { idempotencyKey: createIdempotencyKey() }
      );
      state.roadmapItems = (await productApi.listRoadmapItems(state.projectId)).data;
      state.productActiveModal = "";
      toast("Milestone scheduled on roadmap.");
      render();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to create milestone.");
    }
    return;
  }
  if (form.id === "product-update-strategy-form") {
    const raw = Object.fromEntries(new FormData(form));
    try {
      const principles = String(raw.principles || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const risks = String(raw.risks || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const result = await productApi.saveProductStrategy(
        state.projectId,
        {
          objective: String(raw.objective || ""),
          principles,
          risks
        },
        { idempotencyKey: createIdempotencyKey() }
      );
      state.productStrategy = result.data;
      state.productActiveModal = "";
      toast("Product strategy updated.");
      render();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to update strategy.");
    }
    return;
  }

  if (form.id === "approval-decision-form") {
    const values = new FormData(form);
    const decision = event.submitter instanceof HTMLButtonElement ? event.submitter.value : "";
    try {
      const result = await outputsApi.decideApproval(state.projectId, String(values.get("approvalId")), decision, String(values.get("rationale") || ""), { idempotencyKey: createIdempotencyKey() });
      state.approvals = (await outputsApi.listApprovals(state.projectId)).data;
      state.reports = (await outputsApi.listReports(state.projectId)).data;
      state.approvalDetail = result.data;
      toast(`${result.data.status} recorded. Downstream executed: No.`);
      render();
    } catch (error) { toast(error instanceof Error ? error.message : "Approval decision failed."); }
    return;
  }
  if (form.id === "approval-comment-form") {
    const values = new FormData(form);
    try {
      await outputsApi.addApprovalComment(state.projectId, String(values.get("approvalId")), String(values.get("text") || ""), { idempotencyKey: createIdempotencyKey() });
      state.approvalDetail = (await outputsApi.getApproval(state.projectId, String(values.get("approvalId")))).data;
      toast("Mock review comment added.");
      render();
    } catch (error) { toast(error instanceof Error ? error.message : "Comment failed."); }
    return;
  }
  if (form.id === "memory-search-form") {
    const query = String(new FormData(form).get("query") || "").trim();
    state.contextQuery = query;
    state.memoryResults = (await contextApi.searchMemory(state.projectId, query)).data;
    toast(`Mock memory search returned ${state.memoryResults.length} safe result${state.memoryResults.length === 1 ? "" : "s"}.`);
    render();
    return;
  }
  if (form.id === "create-project-form") {
    const button = form.querySelector('button[type="submit"]');
    const message = form.querySelector("#form-message");
    if (button instanceof HTMLButtonElement) { button.disabled = true; button.textContent = "Creating…"; }
    try {
      const values = Object.fromEntries(new FormData(form));
      const result = await workspaceApi.createProject(values, { idempotencyKey: createIdempotencyKey() });
      await hydrate(values.workspaceId);
      toast("Project created in the mock adapter.");
      navigate(`/app/projects/${result.data.id}/overview`);
      render();
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof ApiError ? `${error.message} · ${error.requestId}` : "Unable to create project.")}</div>`;
    } finally {
      if (button instanceof HTMLButtonElement) { button.disabled = false; button.textContent = "Create project"; }
    }
  }
  if (form.id === "project-settings-form") {
    const id = form.dataset.projectId;
    const values = Object.fromEntries(new FormData(form));
    try {
      await workspaceApi.updateProject(id, values);
      await hydrate(state.workspaceId);
      toast("Project settings updated in the mock adapter.");
    } catch (error) { toast(error instanceof Error ? error.message : "Update failed."); }
  }
  if (form.id === "auth-form") {
    const kind = form.dataset.kind || "login";
    const values = Object.fromEntries(new FormData(form));
    const message = form.querySelector("#auth-message");
    const button = form.querySelector('button[type="submit"]');

    // Client-side Validation
    const email = String(values.email || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      if (message) {
        message.innerHTML = `<div class="alert error" role="alert"><strong>Validation Error:</strong> Please enter a valid work email address.</div>`;
      }
      const emailInput = form.querySelector("#auth-email");
      if (emailInput instanceof HTMLElement) emailInput.focus();
      return;
    }

    if (kind === "register" && (!values.name || String(values.name).trim().length < 2)) {
      if (message) {
        message.innerHTML = `<div class="alert error" role="alert"><strong>Validation Error:</strong> Full name is required (minimum 2 characters).</div>`;
      }
      const nameInput = form.querySelector("#auth-name");
      if (nameInput instanceof HTMLElement) nameInput.focus();
      return;
    }

    if (kind === "register" && !/^\d{10}$/.test(String(values.phoneNo || "").replace(/\D/g, ""))) {
      if (message) message.innerHTML = `<div class="alert error" role="alert"><strong>Validation Error:</strong> Enter a 10-digit phone number.</div>`;
      const phoneInput = form.querySelector("#auth-phone");
      if (phoneInput instanceof HTMLElement) phoneInput.focus();
      return;
    }

    if (kind !== "forgot" && (!values.password || String(values.password).length < 8)) {
      if (message) {
        message.innerHTML = `<div class="alert error" role="alert"><strong>Validation Error:</strong> Password must be at least 8 characters.</div>`;
      }
      const passInput = form.querySelector("#auth-password");
      if (passInput instanceof HTMLElement) passInput.focus();
      return;
    }

    if (message) message.innerHTML = "";
    if (button instanceof HTMLButtonElement) {
      button.disabled = true;
      button.innerHTML = `<span class="spinner" style="width:14px;height:14px;margin:0 8px 0 0;display:inline-block;vertical-align:middle;border-width:2px;border-top-color:#ffffff;" aria-hidden="true"></span> Authenticating…`;
    }

    try {
      if (kind === "login") {
        await workspaceApi.login(values);
        if (message) {
          message.innerHTML = `<div class="alert success" role="alert"><strong>Authenticated.</strong> Redirecting to platform workspace…</div>`;
        }
        /* signing in lands on Chat workspace */
        location.href = `${location.pathname}#${routes.chat}`;
        await hydrate();
      } else if (kind === "register") {
        await workspaceApi.register(values);
        if (message) {
          message.innerHTML = `<div class="alert success" role="alert"><strong>Account created.</strong> You can now sign in with <strong>${escapeHtml(email)}</strong>.</div>`;
        }
        form.reset();
      } else {
        await workspaceApi.recover(email);
        if (message) {
          message.innerHTML = `<div class="alert success" role="alert"><strong>Recovery Request Dispatched.</strong> If an account is associated with <strong>${escapeHtml(email)}</strong>, access instructions have been sent.</div>`;
        }
      }
    } catch (error) {
      if (message) {
        message.innerHTML = `<div class="alert error" role="alert"><strong>Authentication Notice:</strong> ${escapeHtml(error instanceof Error ? error.message : "Authentication failed.")}</div>`;
      }
    } finally {
      if (button instanceof HTMLButtonElement) {
        button.disabled = false;
        button.textContent = kind === "login" ? "Sign in to Workspace →" : kind === "register" ? "Create Workspace Account →" : "Send Recovery Instructions →";
      }
    }
  }
  if (form.id === "connect-repository-form") {
    const button = form.querySelector('button[type="submit"]');
    const message = form.querySelector("#repo-form-message");
    if (button instanceof HTMLButtonElement) { button.disabled = true; button.textContent = "Connecting…"; }
    try {
      const values = Object.fromEntries(new FormData(form));
      await workspaceApi.connectRepository(state.projectId, values, { idempotencyKey: createIdempotencyKey() });
      state.repositories = (await workspaceApi.listRepositories(state.projectId)).data;
      form.reset();
      document.querySelector("#repo-form-panel")?.classList.add("hidden-panel");
      toast("Repository added as pending in the mock adapter.");
      render();
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof Error ? error.message : "Unable to connect repository.")}</div>`;
    } finally {
      if (button instanceof HTMLButtonElement) { button.disabled = false; button.textContent = "Connect mock repository"; }
    }
  }
  if (form.id === "file-input-form") {
    const file = state.selectedFile?.file || (/** @type {HTMLInputElement|null} */ (form.querySelector("#asset-file"))?.files?.[0]);
    const message = form.querySelector("#input-form-message");
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const inputType = ({ pdf: "pdf", csv: "csv", xlsx: "spreadsheet", xls: "spreadsheet", docx: "document", pptx: "document", png: "image", jpg: "image", jpeg: "image", mp3: "audio", wav: "audio", mp4: "video", mov: "video", log: "log", zip: "code_archive" })[extension] || "file";
    try {
      const initiated = await workspaceApi.initiateUpload(state.projectId, { name: file.name, inputType, byteSize: file.size, mimeType: file.type, sourceType: "upload" }, { idempotencyKey: createIdempotencyKey() });
      await workspaceApi.completeUpload(state.projectId, initiated.data.assetId);
      state.assets = (await workspaceApi.listAssets(state.projectId)).data;
      if (state.selectedFile?.previewUrl) {
        try { URL.revokeObjectURL(state.selectedFile.previewUrl); } catch (_) {}
      }
      state.selectedFile = null;
      form.reset();
      toast("Mock initiate → transfer → complete sequence recorded. File metadata added.");
      render();
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof Error ? error.message : "Upload failed.")}</div>`;
    }
  }
  if (form.id === "text-input-form" || form.id === "url-input-form") {
    const message = form.querySelector("#input-form-message");
    try {
      const values = Object.fromEntries(new FormData(form));
      if (form.id === "text-input-form") await workspaceApi.addTextInput(state.projectId, values);
      else await workspaceApi.addUrlInput(state.projectId, values);
      state.assets = (await workspaceApi.listAssets(state.projectId)).data;
      form.reset();
      toast(form.id === "text-input-form" ? "Text context added to the mock inventory." : "URL accepted by the mock adapter.");
      render();
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof Error ? error.message : "Input failed.")}</div>`;
    }
  }
  if (form.id === "new-conversation-form") {
    const values = Object.fromEntries(new FormData(form));
    try {
      const created = await workspaceApi.createConversation(state.projectId, values, { idempotencyKey: createIdempotencyKey() });
      state.conversations = (await workspaceApi.listConversations(state.projectId)).data;
      state.conversationId = created.data.id;
      state.messages = [];
      form.reset();
      form.classList.add("hidden-panel");
      toast("Conversation created in the mock adapter.");
      render();
    } catch (error) { toast(error instanceof Error ? error.message : "Conversation creation failed."); }
  }
  if (form.id === "message-form") {
    const values = new FormData(form);
    const input = {
      text: values.get("text"),
      assetIds: values.getAll("assetIds"),
      repositoryIds: values.getAll("repositoryIds")
    };
    const message = form.querySelector("#conversation-form-message");
    try {
      await workspaceApi.postMessage(state.projectId, state.conversationId, input, { idempotencyKey: createIdempotencyKey() });
      state.messages = (await workspaceApi.listMessages(state.projectId, state.conversationId)).data;
      state.conversations = (await workspaceApi.listConversations(state.projectId)).data;
      form.reset();
      toast("Message accepted. Context thread updated.");
      render();
      queueMicrotask(() => {
        const thread = document.querySelector(".message-thread");
        if (thread) thread.scrollTop = thread.scrollHeight;
      });
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof Error ? error.message : "Message failed.")}</div>`;
    }
  }
  if (form.id === "analysis-request-form") {
    const values = new FormData(form);
    const input = {
      requestText: values.get("requestText"),
      requestType: values.get("requestType"),
      priority: values.get("priority"),
      executionStrategy: values.get("executionStrategy"),
      conversationId: values.get("conversationId") || undefined,
      assetIds: values.getAll("assetIds"),
      repositoryIds: values.getAll("repositoryIds")
    };
    const message = form.querySelector("#analysis-form-message");
    try {
      const created = await workspaceApi.createAnalysisRequest(state.projectId, input, { idempotencyKey: createIdempotencyKey() });
      state.analysisRequests = (await workspaceApi.listAnalysisRequests(state.projectId)).data;
      form.reset();
      state.analysisTab = "history";
      toast(`Mock analysis receipt created: ${created.data.id}`);
      render();
    } catch (error) {
      if (message) message.innerHTML = `<div class="alert error">${escapeHtml(error instanceof Error ? error.message : "Request failed.")}</div>`;
    }
  }
  if (form.id === "invite-member-form") {
    const values = new FormData(form);
    const email = String(values.get("email") || "").trim();
    const name = String(values.get("name") || "").trim();
    const role = String(values.get("role") || "Member");
    if (!email || !name) return;
    const newMember = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      joinedAt: new Date().toISOString().split("T")[0],
      status: "active"
    };
    state.members = [newMember, ...(state.members || [])];
    state.inviteOpen = false;
    toast(`Invitation sent to ${email}. Added to workspace members.`);
    render();
  }
});

/* ── navigation ───────────────────────────────────────────────────── */

/* ── Chat & Work ─────────────────────────────────────────────────── */


/** Loads whatever the incoming route needs beyond core hydration. */
function loadRouteData() {
  const path = currentPath();
  if (path === routes.dashboard) loadDashboard();
  if (path === routes.chat || path.startsWith(`${routes.chat}/`)) {
    const routeSessionId = path.startsWith(`${routes.chat}/`) ? path.slice(`${routes.chat}/`.length).split("/")[0] : "";
    work.loadWork(routeSessionId);
  }
  if (isIntegrationsRoute(path)) loadIntegrations();
  if (path.startsWith("/app/settings")) loadSettings();
}

function onRouteChange() {
  render();
  loadRouteData();
}

window.addEventListener("hashchange", onRouteChange);
window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    if (!state.commandPaletteEnabled) return;
    event.preventDefault();
    state.searchOpen = !state.searchOpen;
    if (state.searchOpen) {
      state.searchQuery = "";
      state.notificationsOpen = false;
      state.profileOpen = false;
      state.inviteOpen = false;
    }
    render();
    if (state.searchOpen) {
      setTimeout(() => /** @type {HTMLInputElement|null} */ (document.querySelector("#command-search-input"))?.focus(), 50);
    }
  }
  if (event.key === "Escape") {
    if (state.searchOpen || state.notificationsOpen || state.profileOpen || state.inviteOpen || state.sidebarOpen || state.settingsSidebarOpen || state.chatRailOpen) {
      state.searchOpen = false;
      state.notificationsOpen = false;
      state.profileOpen = false;
      state.inviteOpen = false;
      state.sidebarOpen = false;
      state.settingsSidebarOpen = false;
      state.chatRailOpen = false;
      render();
    }
  }
});

/* ── session inactivity policy tracker ───────────────────────────── */
let inactivityTimer = null;
function resetInactivityTimer() {
  if (typeof window === "undefined") return;
  if (inactivityTimer) clearTimeout(inactivityTimer);
  const minutes = Number(state.sessionTimeoutMinutes || 30);
  if (!minutes || minutes <= 0) return;
  inactivityTimer = setTimeout(() => {
    toast(`[Session Inactivity Policy] Inactive for ${minutes} min. Simulated session lock.`);
  }, minutes * 60 * 1000);
}

if (typeof window !== "undefined") {
  ["mousemove", "keydown", "click", "scroll"].forEach((evt) => {
    window.addEventListener(evt, resetInactivityTimer, { passive: true });
  });
  resetInactivityTimer();

  // Restore client-side preferences
  try {
    if (localStorage.getItem("synase_cmd_palette_enabled") !== null) {
      state.commandPaletteEnabled = localStorage.getItem("synase_cmd_palette_enabled") !== "false";
    }
    if (localStorage.getItem("synase_session_timeout")) {
      state.sessionTimeoutMinutes = Number(localStorage.getItem("synase_session_timeout"));
    }
    if (localStorage.getItem("synase_default_surface")) {
      state.defaultLandingSurface = localStorage.getItem("synase_default_surface");
    }
    if (localStorage.getItem("synase_timezone")) {
      state.timezone = localStorage.getItem("synase_timezone");
    }
  } catch (_) {}
}

initTheme();
render();
if (!currentPath().startsWith("/auth/")) {
  hydrate().then(loadRouteData);
} else {
  loadRouteData();
}
