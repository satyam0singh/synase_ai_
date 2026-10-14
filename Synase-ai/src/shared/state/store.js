// @ts-check
/* Single application store.

   This is the state object that used to live in src/app.js, src/phase11.js and
   src/phase12.js as three unrelated literals. They are merged here so one
   router owns every view.

   Scope rules (see ARCHITECTURE.md §6):
   - global      : session, workspace/project selection, theme, UI chrome
   - domain      : product/devops/mcp/context/outputs/integrations projections
   - local       : toast text, sidebar, active tab, loading/error flags

   Keys are grouped by owning domain but share one object so the existing
   `state.x` access patterns keep working unchanged. */

const getSearchParam = (param, fallback) => {
  if (typeof location === "undefined") return fallback;
  try {
    return new URLSearchParams(location.search).get(param) || fallback;
  } catch {
    return fallback;
  }
};

/* @type {Record<string, any>} */
export const state = {
  // ── session + workspace selection (global) ──
  authenticated: true,
  user: null,
  workspaces: [],
  workspaceId: "ws_synase",
  projects: [],
  projectId: "prj_platform",
  members: [],

  // ── project context (workspace) ──
  repositories: [],
  repositoryDetailId: "",
  repositorySnapshots: [],
  repositoryTree: [],
  assets: [],
  inputTab: "file",
  conversations: [],
  conversationId: "",
  messages: [],
  analysisRequests: [],
  analysisTab: getSearchParam("tab", "conversation"),

  // ── workflow execution (workspace) ──
  workflows: [],
  workflowId: "",
  workflowTasks: [],
  workflowEvents: [],
  streamState: "idle",

  // ── mcp domain ──
  mcpOverview: null,
  mcpRequests: [],
  mcpTrace: [],
  mcpRequestId: "",
  mcpModels: [],
  mcpTools: [],
  mcpServers: [],
  mcpDirectories: [],

  // ── product domain ──
  requirements: [],
  productFeatures: [],
  productStrategy: null,
  roadmapItems: [],
  productDecisions: [],
  productOverview: null,
  productSection: getSearchParam("section", "overview"),
  productTab: getSearchParam("productTab", "requirements"),
  productSelectedRequirementId: null,
  productSelectedFeatureId: null,
  productSelectedRoadmapId: null,
  productSelectedDecisionId: null,
  productFilterStatus: "all",
  productFilterPriority: "all",
  productFilterProvenance: "all",
  productSearchQuery: "",
  productActiveModal: null,

  // ── devops domain ──
  devopsSummary: null,
  findings: [],
  devopsRecommendations: [],
  dependencies: [],
  testSuggestions: [],
  deploymentPlans: [],
  devopsTab: getSearchParam("devopsTab", "overview"),

  // ── context domain ──
  contextItems: [],
  memoryResults: [],
  retrievalHistory: [],
  knowledgeGraph: null,
  contextQuery: "",

  // ── outputs domain ──
  reports: [],
  reportId: "",
  reportDetail: null,
  approvals: [],
  approvalId: "",
  approvalDetail: null,

  // ── decision dashboard (workspace) ──
  // Named to avoid colliding with the superseded Phase 2 aggregate; the
  // decision dashboard is what /app/dashboard actually renders.
  decisionDashboard: null,
  decisionDashboardError: "",

  // ── integrations domain (was src/phase11.js state) ──
  integrationProviders: [],
  integrationConnections: [],
  integrationRuns: [],
  activity: [],
  auditEvents: [],
  auditDetail: null,
  integrationReceipt: null,
  integrationError: "",

  // ── work domain (Chat & Work surface) ──
  workSessions: [],
  workSessionId: "",
  workMessages: [],
  workArtifacts: [],
  workArtifactId: "",
  workArtifactsOpen: true,
  workRepository: null,
  workMode: "chat",
  workLayer: "auto",
  workCapability: "",
  workEffort: "auto",
  workMenu: "",
  workComposer: "",
  workThinking: false,
  workAttachments: [],

  // ── settings control plane ──
  settingsValues: [],
  effectiveSettings: {},
  settingsSection: "general",
  settingsSearchQuery: "",
  apiKeys: [],
  settingsConnectors: [],
  settingsAutomations: [],
  agentPolicy: null,
  settingsActiveModal: null,
  settingsInspectedScope: null,
  commandPaletteEnabled: true,
  sessionTimeoutMinutes: 30,
  defaultLandingSurface: "/app/chat",
  timezone: "UTC",
  vaultSelectedFile: null,
  vaultStagedDocuments: [],

  // ── chrome + transient UI (local) ──
  loading: true,
  sidebarOpen: false,
  settingsSidebarOpen: false,
  chatRailOpen: false,
  toast: "",
  error: "",
  searchOpen: false,
  searchQuery: "",
  notificationsOpen: false,
  dismissedNotificationIds: [],
  profileOpen: false,
  inviteOpen: false,
  selectedFile: null,
  uploadingStatus: "",
  uploadProgress: 0,
  isRecordingVoice: false
};

/**
 * Resets the project-scoped projections. Called when a workspace or project
 * switch invalidates everything below the selection.
 */
export function resetProjectScope() {
  state.repositories = [];
  state.repositoryDetailId = "";
  state.repositorySnapshots = [];
  state.repositoryTree = [];
  state.assets = [];
  state.conversations = [];
  state.analysisRequests = [];
  state.messages = [];
  state.workflows = [];
  state.workflowTasks = [];
  state.workflowEvents = [];
  state.workSessions = [];
  state.workSessionId = "";
  state.workMessages = [];
  state.workArtifacts = [];
  state.workArtifactId = "";
  state.workArtifactsOpen = false;
  state.workRepository = null;
  state.productSelectedRequirementId = null;
  state.productSelectedFeatureId = null;
  state.productSelectedRoadmapId = null;
  state.productSelectedDecisionId = null;
  state.productActiveModal = null;
}