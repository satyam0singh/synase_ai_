// @ts-check
/* Deterministic mock adapter.
Method bodies are unchanged from the original src/api.js; only the
module boundaries moved. Every method returns { data, meta }. */

import { db, page, sleep } from "./db.js";
import { ApiError } from "./errors.js";
import { settingsRegistry, getDefinitionsForSection, resolveEffectiveSetting } from "./settingsEngine.js";

const idempotencyStore = new Map();

/* ── Chat & Work helpers ───────────────────────────────────────────
   Deterministic on purpose: the same prompt, layer, capability and effort
   always produce the same reply and artifact, so the surface is testable and
   never implies a model call happened. */

/**
 * @param {string} prefix
 * @returns {string}
 */
function createMockId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * @param {string} effort
 * @returns {number}
 */
function mockConfidence(effort) {
  return { auto: 0.5, low: 0.55, medium: 0.66, high: 0.78, max: 0.86 }[effort] ?? 0.5;
}

/**
 * @param {{layer?: string, capability?: string, effort?: string, prompt?: string}} input
 * @returns {string}
 */
function composeMockReply({ layer, capability, effort, prompt }) {
  const scope =
    layer === "product"
      ? "Product layer"
      : layer === "devops"
        ? "DevOps layer"
        : capability
          ? `Agent capability ${capability.replace(/_/g, " ")}`
          : "Chat mode with no layer or capability selected";
  const effortNote =
    effort === "auto"
      ? "Effort is on auto, which routes to the default modality in this mock."
      : `Effort is set to ${effort}.`;
  const artefactNote = capability === "code" || layer
    ? "A mock draft artifact is attached below."
    : "No artifact is produced in this configuration.";

  return `Mock draft — no model, tool, or network call was made. ${scope}. ${effortNote} ${artefactNote} Nothing here is confirmed project state: route any resulting decision through the approvals queue so a human records it.

Prompt: "${String(prompt).slice(0, 160)}"`;
}

/**
 * @param {{layer?: string, capability?: string, effort?: string, prompt?: string}} input
 * @returns {string}
 */
function composeMockArtifact({ layer, capability, effort, prompt }) {
  const heading = layer === "devops" ? "DevOps review" : layer === "product" ? "Product decision draft" : capability === "code" ? "Proposed interface" : "Research note";
  return `# ${heading} (mock draft)

Deterministic fixture produced by the mock adapter. Nothing was generated,
retrieved, or executed.

## Prompt

> ${String(prompt).slice(0, 200)}

## Scope

| Field | Value |
| --- | --- |
| Layer | ${layer || "none"} |
| Capability | ${capability || "none"} |
| Effort | ${effort} |
| Provenance | ai_suggested |
| Model invoked | No |
| Tool invoked | No |
| External contacted | No |
| Downstream executed | No |

## What a human still has to do

1. Confirm the inputs are real. Every value here is a fixture.
2. Review against the open findings in the DevOps layer.
3. Record the decision in the approvals queue if it should become authoritative.

Executed: No.`;
}

export const mockApi = {
  async login({ email, password }) {
    await sleep(450);
    if (!email || !password) throw new ApiError("VALIDATION_ERROR", "Email and password are required.", 422);
    if (email.includes("blocked")) throw new ApiError("ACCOUNT_SUSPENDED", "This account is suspended.", 403);
    return { data: { user: db.user, authenticated: true } };
  },
  async register(input) {
    await sleep(500);
    if (!input.name || !input.email || !input.password) throw new ApiError("VALIDATION_ERROR", "Complete all required fields.", 422);
    return { data: { status: "verification_required" } };
  },
  async recover(email) {
    await sleep(450);
    if (!email) throw new ApiError("VALIDATION_ERROR", "Enter your email address.", 422);
    return { data: { accepted: true } };
  },
  async getMe() {
    await sleep();
    return { data: db.user };
  },
  async listWorkspaces() {
    await sleep();
    return page(db.workspaces);
  },
  async getWorkspace(id) {
    await sleep();
    const item = db.workspaces.find((workspace) => workspace.id === id);
    if (!item) throw new ApiError("RESOURCE_NOT_FOUND", "Workspace was not found.", 404);
    return { data: item };
  },
  async listWorkspaceMembers() {
    await sleep();
    return page(db.workspaceMembers);
  },
  async inviteWorkspaceMember({ email, role }) {
    await sleep(350);
    if (!email || !role) throw new ApiError("VALIDATION_ERROR", "Email and role are required.", 422);
    return { data: { id: `invite_${Date.now()}`, email, role, status: "pending" } };
  },
  async listProjects(workspaceId) {
    await sleep();
    return page(db.projects.filter((project) => project.workspaceId === workspaceId));
  },
  async getProject(id) {
    await sleep();
    const item = db.projects.find((project) => project.id === id);
    if (!item) throw new ApiError("RESOURCE_NOT_FOUND", "Project was not found.", 404);
    return { data: item };
  },
  async createProject(input, { idempotencyKey } = {}) {
    await sleep(520);
    if (!input.workspaceId || !input.name?.trim()) throw new ApiError("VALIDATION_ERROR", "Workspace and project name are required.", 422);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const duplicate = db.projects.some((project) => project.workspaceId === input.workspaceId && project.name.toLowerCase() === input.name.trim().toLowerCase());
    if (duplicate) throw new ApiError("RESOURCE_CONFLICT", "A project with this name already exists.", 409);
    const project = {
      id: `prj_${Math.random().toString(36).slice(2, 9)}`,
      workspaceId: input.workspaceId,
      name: input.name.trim(),
      slug: input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: input.description?.trim() || "",
      goal: input.goal?.trim() || "",
      lifecycleStatus: "draft",
      role: "owner",
      updatedAt: new Date().toISOString()
    };
    db.projects.unshift(project);
    return { data: project };
  },
  async updateProject(id, patch) {
    await sleep(420);
    const project = db.projects.find((item) => item.id === id);
    if (!project) throw new ApiError("RESOURCE_NOT_FOUND", "Project was not found.", 404);
    Object.assign(project, patch, { updatedAt: new Date().toISOString() });
    return { data: project };
  },
  async getDashboard(workspaceId) {
    await sleep(300);
    const projects = db.projects.filter((project) => project.workspaceId === workspaceId);
    return {
      data: {
        metrics: [
          { label: "Active projects", value: String(projects.filter((p) => p.lifecycleStatus === "active").length), trend: "Workspace scope", tone: "positive" },
          { label: "Contract coverage", value: "72%", trend: "Phases 0–2", tone: "neutral" },
          { label: "Open decisions", value: "11", trend: "4 critical", tone: "warning" },
          { label: "Approval queue", value: "—", trend: "Not available in Phase 2", tone: "neutral" }
        ],
        projects,
        activity: db.activity
      }
    };
  },
  async listRepositories(projectId) {
    await sleep();
    return page(db.repositories.filter((repository) => repository.projectId === projectId));
  },
  async connectRepository(projectId, input, { idempotencyKey } = {}) {
    await sleep(460);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!input.provider || !input.fullName?.trim()) throw new ApiError("VALIDATION_ERROR", "Provider and repository path are required.", 422);
    const repository = {
      id: `repo_${Math.random().toString(36).slice(2, 9)}`,
      projectId,
      provider: input.provider,
      name: input.fullName.trim().split("/").pop(),
      fullName: input.fullName.trim(),
      defaultBranch: input.defaultBranch?.trim() || "main",
      visibility: "unknown",
      connectionStatus: "pending"
    };
    db.repositories.unshift(repository);
    return { data: repository };
  },
  async syncRepository(projectId, repositoryId) {
    await sleep(420);
    const repository = db.repositories.find((item) => item.projectId === projectId && item.id === repositoryId);
    if (!repository) throw new ApiError("RESOURCE_NOT_FOUND", "Repository was not found.", 404);
    if (repository.connectionStatus !== "connected") throw new ApiError("RESOURCE_CONFLICT", "Only connected repositories can be synchronized.", 409);
    repository.lastSyncedAt = new Date().toISOString();
    return { data: { repositoryId, status: "completed", demo: true, completedAt: repository.lastSyncedAt } };
  },
  async listRepositorySnapshots(repositoryId) {
    await sleep();
    return page(db.snapshots.filter((snapshot) => snapshot.repositoryId === repositoryId));
  },
  async getRepositoryTree(repositoryId) {
    await sleep();
    if (!db.repositories.some((item) => item.id === repositoryId)) throw new ApiError("RESOURCE_NOT_FOUND", "Repository was not found.", 404);
    return { data: [
      { path: "src", type: "directory" },
      { path: "src/api", type: "directory" },
      { path: "src/components", type: "directory" },
      { path: "src/app.tsx", type: "file", byteSize: 8240 },
      { path: "README.md", type: "file", byteSize: 4102 }
    ] };
  },
  async listAssets(projectId) {
    await sleep();
    return page(db.assets.filter((asset) => asset.projectId === projectId && asset.processingStatus !== "deleted"));
  },
  async initiateUpload(projectId, input, { idempotencyKey } = {}) {
    await sleep(360);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!input.name || !input.inputType) throw new ApiError("VALIDATION_ERROR", "File name and input type are required.", 422);
    if (input.byteSize > 50 * 1024 * 1024) throw new ApiError("FILE_TOO_LARGE", "The mock project limit is 50 MB.", 413);
    const assetId = `asset_${Math.random().toString(36).slice(2, 9)}`;
    db.assets.unshift({
      id: assetId,
      projectId,
      name: input.name,
      inputType: input.inputType,
      sourceType: input.sourceType || "upload",
      mimeType: input.mimeType || "application/octet-stream",
      byteSize: input.byteSize || 0,
      processingStatus: "received",
      securityScanStatus: "pending",
      extractionStatus: "not_started",
      createdAt: new Date().toISOString()
    });
    return { data: { assetId, upload: { method: "PUT", url: `mock-upload://${assetId}`, expiresAt: new Date(Date.now() + 900000).toISOString(), headers: {} } } };
  },
  async completeUpload(projectId, assetId) {
    await sleep(320);
    const asset = db.assets.find((item) => item.projectId === projectId && item.id === assetId);
    if (!asset) throw new ApiError("RESOURCE_NOT_FOUND", "Asset was not found.", 404);
    return { data: { assetId, processingStatus: asset.processingStatus, demo: true } };
  },
  async addTextInput(projectId, input) {
    await sleep(320);
    if (!input.text?.trim()) throw new ApiError("VALIDATION_ERROR", "Text content is required.", 422);
    const asset = { id: `asset_${Math.random().toString(36).slice(2, 9)}`, projectId, name: input.title?.trim() || "Pasted context", inputType: "text", sourceType: "paste", mimeType: "text/plain", byteSize: input.text.length, processingStatus: "ready", securityScanStatus: "clean", extractionStatus: "completed", createdAt: new Date().toISOString() };
    db.assets.unshift(asset);
    return { data: asset };
  },
  async addUrlInput(projectId, input) {
    await sleep(360);
    try { new URL(input.url); } catch { throw new ApiError("VALIDATION_ERROR", "Enter a valid URL.", 422); }
    const asset = { id: `asset_${Math.random().toString(36).slice(2, 9)}`, projectId, name: input.url, inputType: "url", sourceType: "url", processingStatus: "received", securityScanStatus: "pending", extractionStatus: "not_started", createdAt: new Date().toISOString() };
    db.assets.unshift(asset);
    return { data: asset };
  },
  async advanceAssetDemo(projectId, assetId) {
    await sleep(260);
    const asset = db.assets.find((item) => item.projectId === projectId && item.id === assetId);
    if (!asset) throw new ApiError("RESOURCE_NOT_FOUND", "Asset was not found.", 404);
    const next = { received: "scanning", scanning: "extracting", extracting: "indexing", indexing: "ready" };
    asset.processingStatus = next[asset.processingStatus] || asset.processingStatus;
    if (asset.processingStatus === "extracting") asset.securityScanStatus = "clean";
    if (asset.processingStatus === "indexing") asset.extractionStatus = "completed";
    return { data: { ...asset, demo: true } };
  },
  async deleteAsset(projectId, assetId) {
    await sleep(260);
    const asset = db.assets.find((item) => item.projectId === projectId && item.id === assetId);
    if (!asset) throw new ApiError("RESOURCE_NOT_FOUND", "Asset was not found.", 404);
    asset.processingStatus = "deleted";
    return { data: { assetId, status: "deleted" } };
  },
  async listConversations(projectId) {
    await sleep();
    return page(db.conversations.filter((session) => session.projectId === projectId && session.status !== "deleted"));
  },
  async createConversation(projectId, input, { idempotencyKey } = {}) {
    await sleep(340);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const session = { id: `conv_${Math.random().toString(36).slice(2, 9)}`, projectId, title: input.title?.trim() || "New conversation", status: "active", updatedAt: new Date().toISOString() };
    db.conversations.unshift(session);
    return { data: session };
  },
  async listMessages(projectId, conversationId) {
    await sleep();
    const session = db.conversations.find((item) => item.projectId === projectId && item.id === conversationId);
    if (!session) throw new ApiError("RESOURCE_NOT_FOUND", "Conversation was not found.", 404);
    return page(db.messages.filter((message) => message.conversationId === conversationId && message.status !== "deleted"));
  },
  async postMessage(projectId, conversationId, input, { idempotencyKey } = {}) {
    await sleep(420);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!input.text?.trim()) throw new ApiError("VALIDATION_ERROR", "Message text is required.", 422);
    const session = db.conversations.find((item) => item.projectId === projectId && item.id === conversationId);
    if (!session || session.status !== "active") throw new ApiError("RESOURCE_CONFLICT", "An active conversation is required.", 409);
    const message = { id: `msg_${Math.random().toString(36).slice(2, 9)}`, conversationId, role: "user", text: input.text.trim(), status: "submitted", assetIds: input.assetIds || [], repositoryIds: input.repositoryIds || [], createdAt: new Date().toISOString() };
    db.messages.push(message);
    db.messages.push({ id: `msg_${Math.random().toString(36).slice(2, 9)}`, conversationId, role: "system", text: "Mock adapter receipt: message accepted. No AI response or workflow execution occurred.", status: "completed", assetIds: [], repositoryIds: [], createdAt: new Date().toISOString(), mock: true });
    session.updatedAt = new Date().toISOString();
    return { data: message };
  },
  async listAnalysisRequests(projectId) {
    await sleep();
    return page(db.analysisRequests.filter((request) => request.projectId === projectId));
  },
  async createAnalysisRequest(projectId, input, { idempotencyKey } = {}) {
    await sleep(480);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!input.requestText?.trim() || !input.requestType) throw new ApiError("VALIDATION_ERROR", "Request text and request type are required.", 422);
    const ownedAssets = new Set(db.assets.filter((item) => item.projectId === projectId).map((item) => item.id));
    const ownedRepositories = new Set(db.repositories.filter((item) => item.projectId === projectId).map((item) => item.id));
    if ((input.assetIds || []).some((id) => !ownedAssets.has(id)) || (input.repositoryIds || []).some((id) => !ownedRepositories.has(id))) {
      throw new ApiError("INVALID_CONTEXT_REFERENCE", "All context references must belong to the project.", 422);
    }
    const request = {
      id: `req_${Math.random().toString(36).slice(2, 9)}`,
      projectId,
      conversationId: input.conversationId || undefined,
      requestText: input.requestText.trim(),
      requestType: input.requestType,
      priority: input.priority || "normal",
      executionStrategy: input.executionStrategy || "hybrid",
      assetIds: input.assetIds || [],
      repositoryIds: input.repositoryIds || [],
      status: "queued",
      workflowId: `wf_mock_${Math.random().toString(36).slice(2, 8)}`,
      traceId: `trace_mock_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      mock: true
    };
    db.analysisRequests.unshift(request);
    return { data: request };
  },
  async cancelAnalysisRequest(projectId, requestId) {
    await sleep(340);
    const request = db.analysisRequests.find((item) => item.projectId === projectId && item.id === requestId);
    if (!request) throw new ApiError("RESOURCE_NOT_FOUND", "Analysis request was not found.", 404);
    if (!["received", "validated", "queued", "processing"].includes(request.status)) throw new ApiError("RESOURCE_CONFLICT", "This request cannot be cancelled.", 409);
    request.status = "cancelled";
    return { data: { ...request } };
  },
  async listWorkflows(projectId) {
    await sleep();
    return page(db.workflows.filter((workflow) => workflow.projectId === projectId));
  },
  async getWorkflow(projectId, workflowId) {
    await sleep();
    const workflow = db.workflows.find((item) => item.projectId === projectId && item.id === workflowId);
    if (!workflow) throw new ApiError("RESOURCE_NOT_FOUND", "Workflow was not found.", 404);
    return { data: { ...workflow } };
  },
  async listWorkflowTasks(projectId, workflowId) {
    await sleep();
    await this.getWorkflow(projectId, workflowId);
    return page(db.workflowTasks.filter((task) => task.workflowId === workflowId).sort((a, b) => a.sequence - b.sequence));
  },
  async listWorkflowEvents(projectId, workflowId) {
    await sleep();
    await this.getWorkflow(projectId, workflowId);
    return page(db.workflowEvents.filter((event) => event.workflowId === workflowId).sort((a, b) => a.sequence - b.sequence));
  },
  async controlWorkflow(projectId, workflowId, action) {
    await sleep(360);
    const workflow = db.workflows.find((item) => item.projectId === projectId && item.id === workflowId);
    if (!workflow) throw new ApiError("RESOURCE_NOT_FOUND", "Workflow was not found.", 404);
    const allowed = {
      pause: ["running", "waiting"],
      resume: ["paused", "waiting"],
      cancel: ["created", "queued", "running", "waiting", "paused"]
    };
    if (!allowed[action]?.includes(workflow.status)) throw new ApiError("RESOURCE_CONFLICT", `Workflow cannot ${action} from ${workflow.status}.`, 409);
    workflow.status = action === "pause" ? "paused" : action === "resume" ? "running" : "cancelled";
    workflow.updatedAt = new Date().toISOString();
    return { data: { ...workflow } };
  },
  async nextMockWorkflowEvent(projectId, workflowId) {
    await sleep(260);
    const workflow = db.workflows.find((item) => item.projectId === projectId && item.id === workflowId);
    if (!workflow) throw new ApiError("RESOURCE_NOT_FOUND", "Workflow was not found.", 404);
    const script = db.workflowScripts[workflowId] || [];
    const emitted = new Set(db.workflowEvents.filter((event) => event.workflowId === workflowId).map((event) => event.eventId));
    const template = script.find((event) => !emitted.has(event.eventId));
    if (!template) return { data: { event: null, terminal: ["completed", "failed", "cancelled"].includes(workflow.status) } };
    const event = { ...template, occurredAt: new Date().toISOString() };
    db.workflowEvents.push(event);
    workflow.progressPercent = event.payload.progressPercent ?? workflow.progressPercent;
    workflow.currentStage = event.payload.stage ?? workflow.currentStage;
    if (event.eventType === "workflow.completed") workflow.status = "completed";
    workflow.updatedAt = event.occurredAt;
    return { data: { event, workflow: { ...workflow }, terminal: event.eventType === "workflow.completed" } };
  },
  async getMcpOverview() {
    await sleep();
    return { data: {
      requestCount: db.mcpRequests.length,
      completedCount: db.mcpRequests.filter((item) => ["completed", "validated", "cached"].includes(item.status)).length,
      averageConfidence: Number((db.mcpRequests.reduce((sum, item) => sum + item.confidence, 0) / db.mcpRequests.length).toFixed(2)),
      healthyServers: db.mcpServers.filter((item) => item.healthStatus === "healthy").length,
      modelCount: db.mcpModels.length,
      toolCount: db.mcpTools.length
    } };
  },
  async listMcpRequests() { await sleep(); return page(db.mcpRequests); },
  async getMcpTrace(requestId) {
    await sleep();
    if (!db.mcpRequests.some((item) => item.id === requestId)) throw new ApiError("RESOURCE_NOT_FOUND", "MCP request was not found.", 404);
    return page(db.mcpTrace.filter((stage) => stage.requestId === requestId).sort((a, b) => a.sequence - b.sequence));
  },
  async listMcpModels() { await sleep(); return page(db.mcpModels); },
  async listMcpTools() { await sleep(); return page(db.mcpTools); },
  async listMcpServers() { await sleep(); return page(db.mcpServers); },
  async listMcpDirectories() { await sleep(); return page(db.mcpDirectories); },
  async checkMcpServerHealth(serverId) {
    await sleep(320);
    const server = db.mcpServers.find((item) => item.id === serverId);
    if (!server) throw new ApiError("RESOURCE_NOT_FOUND", "MCP server was not found.", 404);
    server.healthStatus = server.healthStatus === "unknown" ? "healthy" : server.healthStatus;
    return { data: { serverId, healthStatus: server.healthStatus, checkedAt: new Date().toISOString(), mock: true } };
  },
  async discoverMcpDirectory(directoryId, { idempotencyKey } = {}) {
    await sleep(380);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const directory = db.mcpDirectories.find((item) => item.id === directoryId);
    if (!directory) throw new ApiError("RESOURCE_NOT_FOUND", "MCP directory was not found.", 404);
    const run = { id: `discovery_${Math.random().toString(36).slice(2, 8)}`, directoryId, status: "completed", resultsCount: 2, createdAt: new Date().toISOString(), mock: true };
    db.discoveryRuns.unshift(run);
    return { data: run };
  },
  // ── Product Intelligence Domain ──
  async getProductOverview(projectId) {
    await sleep();
    const reqs = db.requirements.filter((item) => item.projectId === projectId);
    const feats = db.productFeatures.filter((item) => item.projectId === projectId);
    const roadmap = db.roadmapItems.filter((item) => item.projectId === projectId);
    const strat = db.productStrategy[projectId] || null;
    const approvedReqs = reqs.filter((r) => r.status === "approved" || r.status === "implemented").length;
    const suggestedReqs = reqs.filter((r) => r.provenance === "ai_suggested").length;
    const activeRoad = roadmap.find((r) => r.status === "active")?.milestone || "Foundations";
    const completedRoad = roadmap.filter((r) => r.status === "completed").length;
    const progress = roadmap.length ? Math.round((completedRoad / roadmap.length) * 100) : 0;
    const coverage = reqs.length ? Math.round((approvedReqs / reqs.length) * 100) : 74;

    const metrics = {
      totalRequirements: reqs.length,
      approvedRequirements: approvedReqs,
      suggestedRequirements: suggestedReqs,
      prioritizedFeatures: feats.length,
      activeMilestone: activeRoad,
      roadmapProgress: progress,
      requirementsCoverage: coverage,
      topRisksCount: strat?.risks?.length || 3
    };

    return {
      data: {
        ...metrics,
        metrics
      }
    };
  },
  async listRequirements(projectId) {
    await sleep();
    return page(db.requirements.filter((item) => item.projectId === projectId));
  },
  async getRequirement(projectId, requirementId) {
    await sleep();
    const item = db.requirements.find((r) => r.projectId === projectId && r.id === requirementId);
    if (!item) throw new ApiError("RESOURCE_NOT_FOUND", `Requirement ${requirementId} not found.`, 404);
    return { data: structuredClone(item) };
  },
  async createRequirement(projectId, input, { idempotencyKey } = {}) {
    await sleep(240);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (idempotencyStore.has(idempotencyKey)) {
      return structuredClone(idempotencyStore.get(idempotencyKey));
    }
    if (!input?.title?.trim()) throw new ApiError("VALIDATION_ERROR", "Requirement title is required.", 422);

    const id = input.id || `REQ-${Math.floor(100 + Math.random() * 900)}`;
    const newReq = {
      id,
      projectId,
      title: input.title.trim(),
      type: input.type || "functional",
      priority: input.priority || "medium",
      status: input.status || "identified",
      evidence: Array.isArray(input.evidence) ? input.evidence : (input.evidence ? [input.evidence] : ["User input"]),
      rationale: input.rationale || "Specified by product manager.",
      architectureImpact: input.architectureImpact || "Under assessment",
      provenance: input.provenance || "confirmed",
      confidence: input.provenance === "ai_suggested" ? (input.confidence || 0.75) : 1
    };
    db.requirements.unshift(newReq);
    const res = { data: structuredClone(newReq) };
    idempotencyStore.set(idempotencyKey, res);
    return res;
  },
  async updateRequirement(projectId, requirementId, patch, { idempotencyKey } = {}) {
    await sleep(200);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const item = db.requirements.find((r) => r.projectId === projectId && r.id === requirementId);
    if (!item) throw new ApiError("RESOURCE_NOT_FOUND", `Requirement ${requirementId} not found.`, 404);

    for (const key of ["title", "type", "priority", "status", "rationale", "architectureImpact", "evidence", "provenance", "confidence"]) {
      if (patch && key in patch) item[key] = patch[key];
    }
    return { data: structuredClone(item) };
  },
  async deleteRequirement(projectId, requirementId, { idempotencyKey } = {}) {
    await sleep(180);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const idx = db.requirements.findIndex((r) => r.projectId === projectId && r.id === requirementId);
    if (idx === -1) throw new ApiError("RESOURCE_NOT_FOUND", `Requirement ${requirementId} not found.`, 404);
    const removed = db.requirements.splice(idx, 1)[0];
    return { data: { id: removed.id, deleted: true, success: true } };
  },
  async importRequirements(projectId, items, { idempotencyKey } = {}) {
    await sleep(250);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!Array.isArray(items) || !items.length) throw new ApiError("VALIDATION_ERROR", "A non-empty list of requirements is required.", 422);
    const imported = [];
    for (const input of items) {
      const id = input.id || `REQ-IMP-${Math.floor(100 + Math.random() * 900)}`;
      const req = {
        id,
        projectId,
        title: input.title?.trim() || "Untitled Requirement",
        type: input.type || "functional",
        priority: input.priority || "medium",
        status: input.status || "proposed",
        rationale: input.rationale || "Imported requirement item.",
        evidence: Array.isArray(input.evidence) ? input.evidence : (input.evidence ? [input.evidence] : ["External Import"]),
        architectureImpact: input.architectureImpact || "Under assessment",
        provenance: input.provenance || "confirmed",
        confidence: input.provenance === "ai_suggested" ? (input.confidence || 0.8) : 1
      };
      db.requirements.unshift(req);
      imported.push(req);
    }
    return { data: structuredClone(imported), meta: { importedCount: imported.length } };
  },

  async listProductFeatures(projectId) {
    await sleep();
    return page(db.productFeatures.filter((item) => item.projectId === projectId).sort((a,b) => a.priorityRank - b.priorityRank));
  },
  async getFeature(projectId, featureId) {
    await sleep();
    const item = db.productFeatures.find((f) => f.projectId === projectId && f.id === featureId);
    if (!item) throw new ApiError("RESOURCE_NOT_FOUND", `Feature ${featureId} not found.`, 404);
    return { data: structuredClone(item) };
  },
  async createFeature(projectId, input, { idempotencyKey } = {}) {
    await sleep(220);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!input?.title?.trim()) throw new ApiError("VALIDATION_ERROR", "Feature title is required.", 422);

    const id = input.id || `FEAT-${Math.floor(10 + Math.random() * 90)}`;
    const maxRank = Math.max(0, ...db.productFeatures.filter((f) => f.projectId === projectId).map((f) => f.priorityRank || 0));
    const newFeat = {
      id,
      projectId,
      title: input.title.trim(),
      businessValue: Number(input.businessValue) || 7,
      impact: Number(input.impact) || 7,
      effort: Number(input.effort) || 5,
      risk: Number(input.risk) || 3,
      priorityRank: maxRank + 1,
      status: input.status || "candidate",
      rationale: input.rationale || "Derived from feature analysis.",
      provenance: input.provenance || "confirmed"
    };
    db.productFeatures.push(newFeat);
    return { data: structuredClone(newFeat) };
  },
  async updateFeature(projectId, featureId, patch, { idempotencyKey } = {}) {
    await sleep(200);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const item = db.productFeatures.find((f) => f.projectId === projectId && f.id === featureId);
    if (!item) throw new ApiError("RESOURCE_NOT_FOUND", `Feature ${featureId} not found.`, 404);

    for (const key of ["title", "businessValue", "impact", "effort", "risk", "priorityRank", "status", "rationale", "provenance"]) {
      if (patch && key in patch) item[key] = patch[key];
    }
    return { data: structuredClone(item) };
  },
  async reprioritizeFeatures(projectId, ranks, { idempotencyKey } = {}) {
    await sleep(220);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!Array.isArray(ranks)) throw new ApiError("VALIDATION_ERROR", "Ranks array is required.", 422);

    if (ranks.length > 0 && typeof ranks[0] === "string") {
      ranks.forEach((id, idx) => {
        const feat = db.productFeatures.find((f) => f.projectId === projectId && f.id === id);
        if (feat) feat.priorityRank = idx + 1;
      });
    } else {
      ranks.forEach((item) => {
        const id = item?.id;
        const rank = item?.rank;
        const feat = db.productFeatures.find((f) => f.projectId === projectId && f.id === id);
        if (feat && typeof rank === "number") feat.priorityRank = rank;
      });
    }
    const updated = db.productFeatures.filter((f) => f.projectId === projectId).sort((a, b) => a.priorityRank - b.priorityRank);
    return { data: structuredClone(updated) };
  },
  async deleteFeature(projectId, featureId, { idempotencyKey } = {}) {
    await sleep(180);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const idx = db.productFeatures.findIndex((f) => f.projectId === projectId && f.id === featureId);
    if (idx === -1) throw new ApiError("RESOURCE_NOT_FOUND", `Feature ${featureId} not found.`, 404);
    const removed = db.productFeatures.splice(idx, 1)[0];
    return { data: { id: removed.id, deleted: true, success: true } };
  },

  async getProductStrategy(projectId) {
    await sleep();
    return { data: db.productStrategy[projectId] || null };
  },
  async saveProductStrategy(projectId, input, { idempotencyKey } = {}) {
    await sleep(250);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!input?.objective?.trim()) throw new ApiError("VALIDATION_ERROR", "Strategic objective is required.", 422);

    const strat = {
      id: db.productStrategy[projectId]?.id || `strat_${projectId}`,
      projectId,
      objective: input.objective.trim(),
      principles: Array.isArray(input.principles) ? input.principles : [],
      risks: Array.isArray(input.risks) ? input.risks : [],
      provenance: input.provenance || "confirmed",
      updatedAt: new Date().toISOString()
    };
    db.productStrategy[projectId] = strat;
    return { data: structuredClone(strat) };
  },

  async listRoadmapItems(projectId) {
    await sleep();
    return page(db.roadmapItems.filter((item) => item.projectId === projectId).sort((a,b) => a.sequence - b.sequence));
  },
  async createRoadmapItem(projectId, input, { idempotencyKey } = {}) {
    await sleep(220);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!input?.milestone?.trim()) throw new ApiError("VALIDATION_ERROR", "Milestone title is required.", 422);

    const maxSeq = Math.max(0, ...db.roadmapItems.filter((r) => r.projectId === projectId).map((r) => r.sequence || 0));
    const newItem = {
      id: input.id || `ROAD-0${maxSeq + 1}`,
      projectId,
      milestone: input.milestone.trim(),
      release: input.release || `R${maxSeq + 1}`,
      sequence: maxSeq + 1,
      status: input.status || "planned",
      startDate: input.startDate || "",
      endDate: input.endDate || "",
      dependencies: Array.isArray(input.dependencies) ? input.dependencies : [],
      featureIds: Array.isArray(input.featureIds) ? input.featureIds : [],
      requirementIds: Array.isArray(input.requirementIds) ? input.requirementIds : []
    };
    db.roadmapItems.push(newItem);
    return { data: structuredClone(newItem) };
  },
  async updateRoadmapItem(projectId, roadmapItemId, patch, { idempotencyKey } = {}) {
    await sleep(200);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const item = db.roadmapItems.find((r) => r.projectId === projectId && r.id === roadmapItemId);
    if (!item) throw new ApiError("RESOURCE_NOT_FOUND", `Roadmap item ${roadmapItemId} not found.`, 404);

    for (const key of ["milestone", "release", "sequence", "status", "startDate", "endDate", "dependencies", "featureIds", "requirementIds"]) {
      if (patch && key in patch) item[key] = patch[key];
    }
    return { data: structuredClone(item) };
  },
  async deleteRoadmapItem(projectId, roadmapItemId, { idempotencyKey } = {}) {
    await sleep(180);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const idx = db.roadmapItems.findIndex((r) => r.projectId === projectId && r.id === roadmapItemId);
    if (idx === -1) throw new ApiError("RESOURCE_NOT_FOUND", `Roadmap item ${roadmapItemId} not found.`, 404);
    const removed = db.roadmapItems.splice(idx, 1)[0];
    return { data: { id: removed.id, deleted: true, success: true } };
  },
  async resequenceRoadmap(projectId, sequenceList, { idempotencyKey } = {}) {
    await sleep(220);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!Array.isArray(sequenceList)) throw new ApiError("VALIDATION_ERROR", "Sequence list array is required.", 422);
    sequenceList.forEach((entry, idx) => {
      const id = typeof entry === "string" ? entry : entry.id;
      const item = db.roadmapItems.find((r) => r.projectId === projectId && r.id === id);
      if (item) item.sequence = typeof entry === "object" && typeof entry.sequence === "number" ? entry.sequence : idx + 1;
    });
    const updated = db.roadmapItems.filter((r) => r.projectId === projectId).sort((a, b) => a.sequence - b.sequence);
    return { data: structuredClone(updated) };
  },

  async listProductDecisions(projectId) {
    await sleep();
    const items = (db.productDecisions || []).filter((item) => item.projectId === projectId);
    return page(items);
  },
  async getProductDecision(projectId, decisionId) {
    await sleep();
    const item = (db.productDecisions || []).find((d) => d.projectId === projectId && d.id === decisionId);
    if (!item) throw new ApiError("RESOURCE_NOT_FOUND", `Decision ${decisionId} not found.`, 404);
    return { data: structuredClone(item) };
  },

  async runProductMock(projectId, action, { idempotencyKey } = {}) {
    await sleep(360);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!["requirements", "prioritization", "strategy", "roadmap", "overview", "decisions"].includes(action)) {
      throw new ApiError("VALIDATION_ERROR", "Unknown product action.", 422);
    }
    return { data: { projectId, action, status: "mock_completed", changedRecords: 0, mock: true, completedAt: new Date().toISOString() } };
  },
  async runProductIntelligenceAction(projectId, action, { idempotencyKey } = {}) {
    return this.runProductMock(projectId, action, { idempotencyKey });
  },
  async analyzeProductRequirements(projectId, { idempotencyKey } = {}) {
    await sleep(350);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const count = (db.requirements || []).filter((r) => r.projectId === projectId).length;
    return { data: { projectId, analyzedCount: count, generatedSuggestions: 2, status: "mock_completed", completedAt: new Date().toISOString() } };
  },
  async getProductRequirementsSummary(projectId) {
    await sleep();
    const reqs = (db.requirements || []).filter((r) => r.projectId === projectId);
    return {
      data: {
        projectId,
        total: reqs.length,
        confirmed: reqs.filter((r) => r.provenance === "confirmed").length,
        aiSuggested: reqs.filter((r) => r.provenance === "ai_suggested").length,
        byPriority: {
          high: reqs.filter((r) => r.priority === "high" || r.priority === "critical").length,
          medium: reqs.filter((r) => r.priority === "medium").length,
          low: reqs.filter((r) => r.priority === "low").length
        }
      }
    };
  },
  async analyzeProductStrategy(projectId, { idempotencyKey } = {}) {
    await sleep(350);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    return { data: { projectId, alignmentScore: 94, status: "mock_completed", completedAt: new Date().toISOString() } };
  },
  async generateProductRoadmap(projectId, { idempotencyKey } = {}) {
    await sleep(350);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    return { data: { projectId, sequenceOptimized: true, status: "mock_completed", completedAt: new Date().toISOString() } };
  },

  async getDevOpsSummary(projectId) { await sleep(); return { data: db.devopsSummary[projectId] || null }; },
  async listFindings(projectId) { await sleep(); return page(db.findings.filter((item) => item.projectId === projectId)); },
  async listDevOpsRecommendations(projectId) { await sleep(); return page(db.devopsRecommendations.filter((item) => item.projectId === projectId)); },
  async listDependencies(projectId) { await sleep(); return page(db.dependencies.filter((item) => item.projectId === projectId)); },
  async listTestSuggestions(projectId) { await sleep(); return page(db.testSuggestions.filter((item) => item.projectId === projectId)); },
  async listDeploymentPlans(projectId) { await sleep(); return page(db.deploymentPlans.filter((item) => item.projectId === projectId)); },
  async runDevOpsMock(projectId, domain, { idempotencyKey } = {}) {
    await sleep(360);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    return { data: { projectId, domain, status: "mock_completed", executedActions: 0, mock: true, completedAt: new Date().toISOString() } };
  },
  async listContextItems(projectId) { await sleep(); return page(db.contextItems.filter((item) => item.projectId === projectId)); },
  async searchMemory(projectId, query = "") {
    await sleep();
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const items = db.memoryItems.filter((item) => item.projectId === projectId && (!terms.length || terms.some((term) => `${item.title} ${item.excerpt}`.toLowerCase().includes(term))));
    return page(items.sort((a, b) => b.relevance - a.relevance));
  },
  async listRetrievalHistory(projectId) {
    await sleep();
    return page(db.retrievalHistory.filter((item) => item.projectId === projectId).map((item) => ({ ...item, items: [...item.items].sort((a, b) => a.rank - b.rank) })));
  },
  async getKnowledgeGraph(projectId) {
    await sleep();
    const graph = db.knowledgeGraphs[projectId];
    return { data: graph || { projectId, status: "ready", storageBoundary: "Neo4j is backend-only; this response is a safe domain projection.", nodes: [], edges: [] } };
  },
  async runContextMock(projectId, action, { idempotencyKey } = {}) {
    await sleep(360);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!["reindex", "graph_sync"].includes(action)) throw new ApiError("VALIDATION_ERROR", "Unknown context action.", 422);
    return { data: { projectId, action, status: "mock_completed", changedRecords: 0, contactedStores: false, mock: true, completedAt: new Date().toISOString() } };
  },
  async listReports(projectId) { await sleep(); return page(db.reports.filter((item) => item.projectId === projectId)); },
  async getReport(projectId, reportId) {
    await sleep();
    const report = db.reports.find((item) => item.projectId === projectId && item.id === reportId);
    if (!report) throw new ApiError("RESOURCE_NOT_FOUND", "Decision report was not found.", 404);
    return { data: structuredClone(report) };
  },
  async listApprovals(projectId) { await sleep(); return page(db.approvals.filter((item) => item.projectId === projectId)); },
  async getApproval(projectId, approvalId) {
    await sleep();
    const approval = db.approvals.find((item) => item.projectId === projectId && item.id === approvalId);
    if (!approval) throw new ApiError("RESOURCE_NOT_FOUND", "Approval was not found.", 404);
    return { data: structuredClone(approval) };
  },
  async generateReport(projectId, type, { idempotencyKey } = {}) {
    await sleep(360);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    return { data: { projectId, type, status: "queued", workflowId: "wf_mock_report", reportId: null, mock: true, generated: false } };
  },
  async publishReport(projectId, reportId, { idempotencyKey } = {}) {
    await sleep(360);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const report = db.reports.find((item) => item.projectId === projectId && item.id === reportId);
    if (!report) throw new ApiError("RESOURCE_NOT_FOUND", "Decision report was not found.", 404);
    if (report.status !== "approved") throw new ApiError("APPROVAL_REQUIRED", "An approved report is required before publication.", 409);
    return { data: { reportId, status: "mock_receipt", published: false, mock: true } };
  },
  async exportReport(projectId, reportId, format, { idempotencyKey } = {}) {
    await sleep(360);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    await this.getReport(projectId, reportId);
    const artifact = { id: `exp_${Math.random().toString(36).slice(2,8)}`, reportId, format, status: "mock_ready", downloadUrl: null, expiresAt: null, mock: true };
    db.exportArtifacts.unshift(artifact);
    return { data: artifact };
  },
  async decideApproval(projectId, approvalId, decision, rationale, { idempotencyKey } = {}) {
    await sleep(360);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!["approve", "reject"].includes(decision)) throw new ApiError("VALIDATION_ERROR", "Unknown approval decision.", 422);
    const approval = db.approvals.find((item) => item.projectId === projectId && item.id === approvalId);
    if (!approval) throw new ApiError("RESOURCE_NOT_FOUND", "Approval was not found.", 404);
    if (approval.status !== "pending") throw new ApiError("RESOURCE_CONFLICT", "Only pending approvals can be decided.", 409);
    approval.status = decision === "approve" ? "approved" : "rejected";
    approval.decidedAt = new Date().toISOString();
    approval.decisionRationale = rationale || "";
    approval.executed = false;
    const report = db.reports.find((item) => item.id === approval.reportId);
    if (report && approval.type === "report_publication") {
      report.approvalStatus = approval.status;
      if (approval.status === "approved") report.status = "approved";
    }
    return { data: { ...structuredClone(approval), downstreamExecuted: false, mock: true } };
  },
  async addApprovalComment(projectId, approvalId, text, { idempotencyKey } = {}) {
    await sleep(300);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const approval = db.approvals.find((item) => item.projectId === projectId && item.id === approvalId);
    if (!approval) throw new ApiError("RESOURCE_NOT_FOUND", "Approval was not found.", 404);
    if (!text?.trim()) throw new ApiError("VALIDATION_ERROR", "Comment text is required.", 422);
    const comment = { id: `cmt_${Math.random().toString(36).slice(2,8)}`, author: "Satyam Singh", text: text.trim(), createdAt: new Date().toISOString(), mock: true };
    approval.comments.push(comment);
    return { data: comment };
  },
  async cancelApproval(projectId, approvalId, { idempotencyKey } = {}) {
    await sleep(300);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const approval = db.approvals.find((item) => item.projectId === projectId && item.id === approvalId);
    if (!approval) throw new ApiError("RESOURCE_NOT_FOUND", "Approval was not found.", 404);
    if (approval.status !== "pending") throw new ApiError("RESOURCE_CONFLICT", "Only pending approvals can be cancelled.", 409);
    approval.status = "cancelled";
    approval.executed = false;
    return { data: { ...structuredClone(approval), downstreamExecuted: false, mock: true } };
  },

  /* ── Chat & Work ────────────────────────────────────────────────
     Deterministic assistant replies. No model, tool, network call, or
     filesystem write happens here; every response carries the mock
     markers the rest of the adapter uses. */

  async listWorkSessions(projectId) {
    await sleep(150);
    return page(db.workSessions.filter((item) => item.projectId === projectId));
  },
  async getWorkSession(projectId, sessionId) {
    await sleep(120);
    const session = db.workSessions.find((item) => item.projectId === projectId && item.id === sessionId);
    if (!session) throw new ApiError("RESOURCE_NOT_FOUND", "Work session was not found.", 404);
    return { data: structuredClone(session) };
  },
  async createWorkSession(projectId, input, { idempotencyKey } = {}) {
    await sleep(180);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!db.projects.some((item) => item.id === projectId)) {
      throw new ApiError("RESOURCE_NOT_FOUND", "Project was not found.", 404);
    }
    const session = {
      id: createMockId("wrk"),
      projectId,
      title: String(input?.title || "New work session").slice(0, 90),
      status: "active",
      mode: input?.mode === "work" ? "work" : "chat",
      layer: input?.layer || "",
      capability: input?.capability || "",
      effort: input?.effort || "auto",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mock: true
    };
    db.workSessions.unshift(session);
    return { data: structuredClone(session) };
  },
  async updateWorkSession(projectId, sessionId, patch, { idempotencyKey } = {}) {
    await sleep(160);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const session = db.workSessions.find((item) => item.projectId === projectId && item.id === sessionId);
    if (!session) throw new ApiError("RESOURCE_NOT_FOUND", "Work session was not found.", 404);
    for (const key of ["title", "mode", "layer", "capability", "effort"]) {
      if (patch && key in patch) session[key] = patch[key];
    }
    session.updatedAt = new Date().toISOString();
    return { data: structuredClone(session) };
  },
  async listWorkMessages(projectId, sessionId) {
    await sleep(140);
    const session = db.workSessions.find((item) => item.projectId === projectId && item.id === sessionId);
    if (!session) throw new ApiError("RESOURCE_NOT_FOUND", "Work session was not found.", 404);
    return page(db.workMessages.filter((item) => item.sessionId === sessionId));
  },
  async listWorkArtifacts(projectId, sessionId) {
    await sleep(120);
    const session = db.workSessions.find((item) => item.projectId === projectId && item.id === sessionId);
    if (!session) throw new ApiError("RESOURCE_NOT_FOUND", "Work session was not found.", 404);
    return page(db.workArtifacts.filter((item) => item.sessionId === sessionId));
  },
  async getWorkArtifact(projectId, artifactId) {
    await sleep(100);
    const artifact = db.workArtifacts.find(
      (item) => item.id === artifactId && db.workSessions.some((session) => session.projectId === projectId && session.id === item.sessionId)
    );
    if (!artifact) throw new ApiError("RESOURCE_NOT_FOUND", "Artifact was not found.", 404);
    return { data: structuredClone(artifact) };
  },
  async postWorkMessage(projectId, sessionId, input, { idempotencyKey } = {}) {
    await sleep(260);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const session = db.workSessions.find((item) => item.projectId === projectId && item.id === sessionId);
    if (!session) throw new ApiError("RESOURCE_NOT_FOUND", "Work session was not found.", 404);
    const text = String(input?.text || "").trim();
    if (!text) throw new ApiError("VALIDATION_ERROR", "A message is required.", 400);

    const message = {
      id: createMockId("wmsg"),
      sessionId,
      role: "user",
      text: text.slice(0, 4000),
      createdAt: new Date().toISOString(),
      status: "accepted",
      mock: true
    };
    db.workMessages.push(message);
    if (session.title === "New work session") {
      session.title = text.slice(0, 60);
    }
    session.updatedAt = message.createdAt;
    return { data: structuredClone(message) };
  },
  async runWorkAssistant(projectId, sessionId, input, { idempotencyKey } = {}) {
    await sleep(420);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const session = db.workSessions.find((item) => item.projectId === projectId && item.id === sessionId);
    if (!session) throw new ApiError("RESOURCE_NOT_FOUND", "Work session was not found.", 404);
    const prompt = String(input?.prompt || "").trim();
    if (!prompt) throw new ApiError("VALIDATION_ERROR", "A prompt is required.", 400);

    const layer = session.layer || "";
    const capability = session.capability || "";
    const effort = session.effort || "auto";

    const message = {
      id: createMockId("wmsg"),
      sessionId,
      role: "assistant",
      text: composeMockReply({ layer, capability, effort, prompt }),
      createdAt: new Date().toISOString(),
      status: "accepted",
      mock: true,
      layer,
      capability,
      effort
    };

    let artifact = null;
    if (capability === "code" || capability === "web_search" || layer === "product" || layer === "devops") {
      artifact = {
        id: createMockId("wart"),
        sessionId,
        messageId: message.id,
        kind: capability === "code" ? "code" : layer === "devops" ? "report" : layer === "product" ? "report" : "doc",
        title: `${prompt.slice(0, 60)}${prompt.length > 60 ? "…" : ""} (mock draft)`,
        language: "markdown",
        provenance: "ai_suggested",
        confidence: mockConfidence(effort),
        createdAt: message.createdAt,
        updatedAt: message.createdAt,
        mock: true,
        content: composeMockArtifact({ layer, capability, effort, prompt })
      };
      db.workArtifacts.push(artifact);
      message.artifactId = artifact.id;
    }

    db.workMessages.push(message);
    session.updatedAt = message.createdAt;
    session.effort = effort;
    session.layer = layer;
    session.capability = capability;

    return {
      data: {
        message: structuredClone(message),
        artifact: artifact ? structuredClone(artifact) : null,
        receipt: {
          operation: "work.assistant",
          externalContacted: false,
          downstreamExecuted: false,
          modelInvoked: false,
          toolInvoked: false,
          mock: true
        }
      }
    };
  },
  async connectWorkRepository(projectId, input, { idempotencyKey } = {}) {
    await sleep(300);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const repositories = db.repositories.filter((item) => item.projectId === projectId);
    const existing = repositories.find((item) => item.providerName === "github");
    if (existing) {
      return {
        data: {
          repository: structuredClone(existing),
          receipt: { operation: "work.connect", externalContacted: false, importedRecords: 0, mock: true }
        }
      };
    }
    const repository = {
      id: createMockId("repo"),
      projectId,
      providerName: "github",
      fullName: String(input?.fullName || "satyam022028singh/Synase-ai"),
      connectionStatus: "pending",
      defaultBranch: "main",
      syncStatus: "never",
      lastSyncedAt: null,
      snapshotIds: [],
      createdAt: new Date().toISOString(),
      mock: true
    };
    db.repositories.push(repository);
    return {
      data: {
        repository: structuredClone(repository),
        receipt: { operation: "work.connect", externalContacted: false, importedRecords: 0, mock: true }
      }
    };
  },

  // ── Settings Control Plane Endpoints ──
  async getEffectiveSettings(section, context = {}) {
    await sleep(150);
    const sec = typeof section === "string" ? section : undefined;
    const ctx = typeof section === "object" && section !== null ? section : context;
    const defs = sec ? getDefinitionsForSection(sec) : settingsRegistry;
    const values = db.settingsValues || [];
    const effective = defs.map((def) => resolveEffectiveSetting(def, values, ctx));
    return { data: effective, meta: { total: effective.length, section: sec || "all" } };
  },

  async getSettingDefinitions(section) {
    await sleep(120);
    const defs = section ? getDefinitionsForSection(section) : settingsRegistry;
    return { data: structuredClone(defs), meta: { total: defs.length } };
  },

  async updateSetting(settingId, payload, { idempotencyKey } = {}) {
    await sleep(200);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!idempotencyStore) idempotencyStore = new Map();
    if (idempotencyStore.has(idempotencyKey)) {
      return structuredClone(idempotencyStore.get(idempotencyKey));
    }

    const def = settingsRegistry.find((d) => d.id === settingId);
    if (!def) throw new ApiError("RESOURCE_NOT_FOUND", `Setting ${settingId} not found in registry.`, 404);

    const scope = payload.scope || (def.allowedScopes.includes("workspace") ? "workspace" : def.allowedScopes[0]);
    const scopeId = payload.scopeId || (scope === "workspace" ? "ws_synase" : scope === "project" ? "prj_platform" : "usr_satyam");

    const existingIndex = db.settingsValues.findIndex((v) => v.definitionId === settingId && v.scope === scope && v.scopeId === scopeId);
    let record;
    if (existingIndex !== -1) {
      record = db.settingsValues[existingIndex];
      record.value = payload.value;
      record.version = (record.version || 1) + 1;
      record.updatedAt = new Date().toISOString();
    } else {
      record = {
        definitionId: settingId,
        scope,
        scopeId,
        value: payload.value,
        version: 1,
        updatedAt: new Date().toISOString(),
        updatedBy: "usr_satyam"
      };
      db.settingsValues.push(record);
    }

    const effective = resolveEffectiveSetting(def, db.settingsValues, { workspaceId: "ws_synase", projectId: "prj_platform", userId: "usr_satyam" });
    const response = {
      data: effective,
      meta: { updated: true, version: record.version, receipt: { operation: "settings.update", mock: true } }
    };
    idempotencyStore.set(idempotencyKey, response);
    return response;
  },

  async resetSettings(settingIds, { idempotencyKey } = {}) {
    await sleep(200);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const ids = Array.isArray(settingIds) ? settingIds : settingsRegistry.map((d) => d.id);

    db.settingsValues = db.settingsValues.filter((v) => !ids.includes(v.definitionId));
    const defs = settingsRegistry.filter((d) => ids.includes(d.id));
    const effective = defs.map((def) => resolveEffectiveSetting(def, db.settingsValues));
    return { data: effective, meta: { resetCount: ids.length } };
  },

  async listProviders() {
    await sleep(150);
    return { data: structuredClone(db.providers || []) };
  },

  async getAgentPolicy(agentId) {
    await sleep(150);
    return { data: structuredClone(db.agentPolicy || null) };
  },

  async updateAgentPolicy(agentId, patch, { idempotencyKey } = {}) {
    await sleep(220);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    db.agentPolicy = { ...db.agentPolicy, ...patch };
    return { data: structuredClone(db.agentPolicy) };
  },

  async listApiKeys() {
    await sleep(150);
    return { data: structuredClone(db.apiKeys || []) };
  },

  async createApiKey(payload, { idempotencyKey } = {}) {
    await sleep(250);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    if (!payload?.name?.trim()) throw new ApiError("VALIDATION_ERROR", "Key name is required.", 422);

    const randomSuffix = Math.random().toString(36).slice(2, 6);
    const prefix = `syn_live_${randomSuffix}`;
    const secretRandom = Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join("");
    const oneTimeSecret = `${prefix}_sec_${secretRandom}`;

    const newKey = {
      id: `key_${Date.now()}`,
      name: payload.name.trim(),
      prefix,
      scopes: Array.isArray(payload.scopes) && payload.scopes.length ? payload.scopes : ["analysis:read"],
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      status: "active"
    };
    db.apiKeys.unshift(newKey);

    return {
      data: {
        key: structuredClone(newKey),
        oneTimeSecret,
        secretShownOnce: true
      }
    };
  },

  async revokeApiKey(keyId, { idempotencyKey } = {}) {
    await sleep(200);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const key = db.apiKeys.find((k) => k.id === keyId);
    if (!key) throw new ApiError("RESOURCE_NOT_FOUND", `API key ${keyId} not found.`, 404);
    key.status = "revoked";
    return { data: { id: keyId, status: "revoked", success: true } };
  },

  async listConnectors() {
    await sleep(150);
    return { data: structuredClone(db.settingsConnectors || []) };
  },

  async updateConnector(connectorId, patch, { idempotencyKey } = {}) {
    await sleep(200);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const conn = db.settingsConnectors.find((c) => c.id === connectorId);
    if (!conn) throw new ApiError("RESOURCE_NOT_FOUND", `Connector ${connectorId} not found.`, 404);
    Object.assign(conn, patch);
    return { data: structuredClone(conn) };
  },

  async listAutomations() {
    await sleep(150);
    return { data: structuredClone(db.settingsAutomations || []) };
  },

  async updateAutomation(id, patch, { idempotencyKey } = {}) {
    await sleep(200);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const auto = db.settingsAutomations.find((a) => a.id === id);
    if (!auto) throw new ApiError("RESOURCE_NOT_FOUND", `Automation ${id} not found.`, 404);
    Object.assign(auto, patch);
    return { data: structuredClone(auto) };
  },

  async getUsageSummary() {
    await sleep(150);
    return { data: structuredClone(db.usageSummary || null) };
  },

  async exportWorkspaceData(options = {}, { idempotencyKey } = {}) {
    await sleep(350);
    if (!idempotencyKey) throw new ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
    const sanitizedSettings = (db.settingsValues || []).map((s) => ({
      definitionId: s.definitionId,
      scope: s.scope,
      value: s.value,
      version: s.version
    }));
    const sanitizedConnectors = (db.settingsConnectors || []).map((c) => ({
      id: c.id,
      provider: c.provider,
      name: c.name,
      status: c.status
    }));
    return {
      data: {
        jobId: `job_exp_${Date.now()}`,
        status: "ready",
        schemaVersion: 1,
        format: options.format || "json",
        workspaceId: options.workspaceId || "ws_synase",
        settings: sanitizedSettings,
        connectors: sanitizedConnectors,
        automations: db.settingsAutomations || [],
        exportUrl: "data:application/json;charset=utf-8,%7B%22synase%22%3A%22backup%22%7D",
        completedAt: new Date().toISOString()
      }
    };
  },

  async validateImportData(payload) {
    await sleep(250);
    if (!payload) throw new ApiError("VALIDATION_ERROR", "Payload is required.", 422);
    return {
      data: {
        valid: true,
        detectedSchemaVersion: 1,
        entitiesDetected: { settings: 12, apiKeys: 2, connectors: 3 },
        warnings: []
      }
    };
  }
};
