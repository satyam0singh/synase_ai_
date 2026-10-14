// @ts-check
/* In-memory fixture store backing the deterministic mock adapter.
One shared store: the tables are cross-referenced by every domain
(a dashboard aggregates projects, findings and reports), so splitting
the data would invent coupling that does not exist. Domain facades in
product/, devops/, mcp/ ... expose narrow read/write surfaces over it. */

export const sleep = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export const db = {
  user: {
    id: "usr_satyam",
    email: "satyam@example.com",
    displayName: "Satyam Singh",
    globalRole: "member"
  },
  workspaces: [
    {
      id: "ws_synase",
      name: "SYNASE Core",
      slug: "synase-core",
      description: "Product and engineering decision intelligence.",
      role: "owner",
      status: "active"
    },
    {
      id: "ws_research",
      name: "Research Lab",
      slug: "research-lab",
      description: "Experiments and reference architecture.",
      role: "member",
      status: "active"
    }
  ],
  projects: [
    {
      id: "prj_platform",
      workspaceId: "ws_synase",
      name: "SYNASE Platform",
      slug: "synase-platform",
      description: "Unified product and DevOps intelligence workspace.",
      goal: "Turn project context into evidence-backed engineering decisions.",
      lifecycleStatus: "active",
      role: "owner",
      updatedAt: "2026-09-29T08:20:00Z"
    },
    {
      id: "prj_mcp",
      workspaceId: "ws_synase",
      name: "MCP V2 Runtime",
      slug: "mcp-v2-runtime",
      description: "Observable capability discovery and execution.",
      goal: "Provide traceable orchestration across models, agents, and tools.",
      lifecycleStatus: "active",
      role: "developer",
      updatedAt: "2026-09-28T15:14:00Z"
    },
    {
      id: "prj_design",
      workspaceId: "ws_synase",
      name: "Design System",
      slug: "design-system",
      description: "Accessible engineering-console interface foundations.",
      goal: "Keep the product dense, clear, and consistent.",
      lifecycleStatus: "paused",
      role: "product_manager",
      updatedAt: "2026-09-26T11:02:00Z"
    },
    {
      id: "prj_eval",
      workspaceId: "ws_research",
      name: "Model Evaluation",
      slug: "model-evaluation",
      description: "Confidence and validation research.",
      goal: "Compare decision quality with repeatable evidence.",
      lifecycleStatus: "draft",
      role: "reviewer",
      updatedAt: "2026-09-25T10:40:00Z"
    }
  ],
  workspaceMembers: [
    { userId: "usr_satyam", name: "Satyam Singh", email: "satyam@example.com", role: "owner", joinedAt: "2026-04-10" },
    { userId: "usr_maya", name: "Maya Chen", email: "maya@example.com", role: "admin", joinedAt: "2026-05-14" },
    { userId: "usr_jordan", name: "Jordan Bell", email: "jordan@example.com", role: "member", joinedAt: "2026-07-02" },
    { userId: "usr_lee", name: "Lee Park", email: "lee@example.com", role: "viewer", joinedAt: "2026-08-21" }
  ],
  activity: [
    { id: "act_1", actor: "Maya Chen", action: "updated", target: "API contract foundation", occurredAt: "18 min ago" },
    { id: "act_2", actor: "Satyam Singh", action: "created", target: "Phase 2 implementation plan", occurredAt: "1 hr ago" },
    { id: "act_3", actor: "Jordan Bell", action: "reviewed", target: "Design system tokens", occurredAt: "Yesterday" },
    { id: "act_4", actor: "System", action: "completed", target: "Mock contract validation", occurredAt: "Yesterday" }
  ],
  repositories: [
    {
      id: "repo_core",
      projectId: "prj_platform",
      provider: "github",
      name: "synase-platform",
      fullName: "synase-ai/synase-platform",
      defaultBranch: "main",
      visibility: "private",
      connectionStatus: "connected",
      lastSyncedAt: "2026-09-29T07:42:00Z"
    },
    {
      id: "repo_contracts",
      projectId: "prj_platform",
      provider: "github",
      name: "synase-contracts",
      fullName: "synase-ai/synase-contracts",
      defaultBranch: "main",
      visibility: "private",
      connectionStatus: "pending"
    },
    {
      id: "repo_runtime",
      projectId: "prj_mcp",
      provider: "gitlab",
      name: "mcp-runtime",
      fullName: "synase/mcp-runtime",
      defaultBranch: "develop",
      visibility: "internal",
      connectionStatus: "connected",
      lastSyncedAt: "2026-09-28T18:02:00Z"
    }
  ],
  snapshots: [
    { id: "snap_1", repositoryId: "repo_core", commitSha: "7e4ab91", branch: "main", fileCount: 842, totalBytes: 12820480, scanStatus: "completed", createdAt: "2026-09-29T07:42:00Z" },
    { id: "snap_2", repositoryId: "repo_core", commitSha: "18f2d02", branch: "main", fileCount: 836, totalBytes: 12681210, scanStatus: "completed", createdAt: "2026-09-27T16:10:00Z" }
  ],
  assets: [
    { id: "asset_prd", projectId: "prj_platform", name: "SYNASE Product Requirements.pdf", inputType: "pdf", sourceType: "upload", mimeType: "application/pdf", byteSize: 2483000, processingStatus: "ready", securityScanStatus: "clean", extractionStatus: "completed", createdAt: "2026-09-29T06:10:00Z" },
    { id: "asset_arch", projectId: "prj_platform", name: "Architecture v3.png", inputType: "image", sourceType: "drag_drop", mimeType: "image/png", byteSize: 948200, processingStatus: "indexing", securityScanStatus: "clean", extractionStatus: "completed", createdAt: "2026-09-29T07:28:00Z" },
    { id: "asset_logs", projectId: "prj_platform", name: "deployment-errors.log", inputType: "log", sourceType: "upload", mimeType: "text/plain", byteSize: 183420, processingStatus: "warning", securityScanStatus: "warning", extractionStatus: "partial", createdAt: "2026-09-28T20:02:00Z" },
    { id: "asset_blocked", projectId: "prj_platform", name: "legacy-source.zip", inputType: "code_archive", sourceType: "upload", mimeType: "application/zip", byteSize: 18233200, processingStatus: "failed", securityScanStatus: "blocked", extractionStatus: "not_started", createdAt: "2026-09-28T11:44:00Z" }
  ],
  conversations: [
    { id: "conv_arch", projectId: "prj_platform", title: "Architecture review", status: "active", updatedAt: "2026-09-29T08:42:00Z" },
    { id: "conv_release", projectId: "prj_platform", title: "Release readiness", status: "active", updatedAt: "2026-09-28T14:18:00Z" },
    { id: "conv_mcp", projectId: "prj_mcp", title: "Routing evaluation", status: "active", updatedAt: "2026-09-28T17:01:00Z" }
  ],
  messages: [
    { id: "msg_1", conversationId: "conv_arch", role: "user", text: "Review the architecture implications of the current product requirements.", status: "completed", assetIds: ["asset_prd"], repositoryIds: ["repo_core"], createdAt: "2026-09-29T08:40:00Z" },
    { id: "msg_2", conversationId: "conv_arch", role: "system", text: "Mock adapter receipt: context references were accepted. No AI analysis or workflow execution occurred.", status: "completed", assetIds: [], repositoryIds: [], createdAt: "2026-09-29T08:42:00Z", mock: true },
    { id: "msg_3", conversationId: "conv_release", role: "user", text: "Identify release risks using the deployment logs.", status: "completed", assetIds: ["asset_logs"], repositoryIds: [], createdAt: "2026-09-28T14:12:00Z" }
  ],
  analysisRequests: [
    { id: "req_arch", projectId: "prj_platform", conversationId: "conv_arch", requestText: "Review architecture implications and identify decisions that require approval.", requestType: "architecture_review", priority: "high", executionStrategy: "hybrid", assetIds: ["asset_prd"], repositoryIds: ["repo_core"], status: "queued", workflowId: "wf_mock_arch", traceId: "trace_mock_arch", createdAt: "2026-09-29T08:43:00Z", mock: true },
    { id: "req_risk", projectId: "prj_platform", conversationId: "conv_release", requestText: "Assess release risks using the deployment logs.", requestType: "risk_assessment", priority: "normal", executionStrategy: "sequential", assetIds: ["asset_logs"], repositoryIds: [], status: "received", workflowId: "wf_mock_risk", traceId: "trace_mock_risk", createdAt: "2026-09-28T14:19:00Z", mock: true }
  ],
  workflows: [
    { id: "wf_mock_arch", projectId: "prj_platform", requestId: "req_arch", executionStrategy: "hybrid", status: "running", progressPercent: 42, currentStage: "context_retrieval", createdAt: "2026-09-29T08:43:00Z", updatedAt: "2026-09-29T08:46:00Z", mock: true },
    { id: "wf_mock_risk", projectId: "prj_platform", requestId: "req_risk", executionStrategy: "sequential", status: "waiting", progressPercent: 18, currentStage: "capability_mapping", createdAt: "2026-09-28T14:19:00Z", updatedAt: "2026-09-28T14:22:00Z", mock: true }
  ],
  workflowTasks: [
    { id: "task_1", workflowId: "wf_mock_arch", name: "Detect intent", layer: "orchestrator", status: "completed", progressPercent: 100, sequence: 1 },
    { id: "task_2", workflowId: "wf_mock_arch", name: "Retrieve project context", layer: "orchestrator", status: "running", progressPercent: 60, sequence: 2 },
    { id: "task_3", workflowId: "wf_mock_arch", name: "Map capabilities", layer: "mcp", status: "ready", progressPercent: 0, sequence: 3 },
    { id: "task_4", workflowId: "wf_mock_arch", name: "Generate decision report", layer: "reporting", status: "pending", progressPercent: 0, sequence: 4 },
    { id: "task_5", workflowId: "wf_mock_risk", name: "Detect intent", layer: "orchestrator", status: "completed", progressPercent: 100, sequence: 1 },
    { id: "task_6", workflowId: "wf_mock_risk", name: "Await repository context", layer: "orchestrator", status: "waiting", progressPercent: 20, sequence: 2 }
  ],
  workflowEvents: [
    { eventId: "evt_1", eventType: "workflow.created", workflowId: "wf_mock_arch", occurredAt: "2026-09-29T08:43:00Z", sequence: 1, schemaVersion: "1", payload: { status: "created", progressPercent: 0 } },
    { eventId: "evt_2", eventType: "workflow.stage.started", workflowId: "wf_mock_arch", occurredAt: "2026-09-29T08:44:00Z", sequence: 2, schemaVersion: "1", payload: { stage: "intent_detection", progressPercent: 10 } },
    { eventId: "evt_3", eventType: "workflow.stage.completed", workflowId: "wf_mock_arch", occurredAt: "2026-09-29T08:45:00Z", sequence: 3, schemaVersion: "1", payload: { stage: "intent_detection", progressPercent: 25 } },
    { eventId: "evt_4", eventType: "workflow.stage.started", workflowId: "wf_mock_arch", occurredAt: "2026-09-29T08:46:00Z", sequence: 4, schemaVersion: "1", payload: { stage: "context_retrieval", progressPercent: 42 } }
  ],
  workflowScripts: {
    wf_mock_arch: [
      { eventId: "demo_evt_5", eventType: "workflow.stage.completed", workflowId: "wf_mock_arch", sequence: 5, schemaVersion: "1", payload: { stage: "context_retrieval", progressPercent: 55 } },
      { eventId: "demo_evt_6", eventType: "task.started", workflowId: "wf_mock_arch", sequence: 6, schemaVersion: "1", payload: { taskId: "task_3", stage: "capability_mapping", progressPercent: 64 } },
      { eventId: "demo_evt_7", eventType: "validation.completed", workflowId: "wf_mock_arch", sequence: 7, schemaVersion: "1", payload: { stage: "validation", progressPercent: 82 } },
      { eventId: "demo_evt_8", eventType: "workflow.completed", workflowId: "wf_mock_arch", sequence: 8, schemaVersion: "1", payload: { status: "completed", progressPercent: 100 } }
    ]
  },
  mcpRequests: [
    { id: "mcp_req_arch", workflowId: "wf_mock_arch", detectedLayer: "both", status: "completed", payloadFormat: "toon", confidence: 0.87, validationStatus: "passed", createdAt: "2026-09-29T08:46:00Z", mock: true },
    { id: "mcp_req_risk", workflowId: "wf_mock_risk", detectedLayer: "devops", status: "processing", payloadFormat: "reference", confidence: 0.62, validationStatus: "warning", createdAt: "2026-09-28T14:22:00Z", mock: true },
    { id: "mcp_req_cache", workflowId: "wf_mock_arch", detectedLayer: "product", status: "cached", payloadFormat: "json", confidence: 0.91, validationStatus: "passed", createdAt: "2026-09-27T10:18:00Z", mock: true }
  ],
  mcpTrace: [
    { id: "trace_1", requestId: "mcp_req_arch", chamber: "request_gateway", sequence: 1, status: "completed", durationMs: 18, summary: "Request accepted and correlated" },
    { id: "trace_2", requestId: "mcp_req_arch", chamber: "context_manager", sequence: 2, status: "completed", durationMs: 142, summary: "Selected 8 project context references" },
    { id: "trace_3", requestId: "mcp_req_arch", chamber: "task_layer_intelligence", sequence: 3, status: "completed", durationMs: 36, summary: "Detected product + DevOps scope" },
    { id: "trace_4", requestId: "mcp_req_arch", chamber: "chamber_router", sequence: 4, status: "completed", durationMs: 24, summary: "Routed to architecture-review capability" },
    { id: "trace_5", requestId: "mcp_req_arch", chamber: "tool_model_execution", sequence: 5, status: "completed", durationMs: 1260, summary: "Mock execution metadata only; no model or tool ran" },
    { id: "trace_6", requestId: "mcp_req_arch", chamber: "validation", sequence: 6, status: "completed", durationMs: 84, summary: "Validation passed with warnings resolved" },
    { id: "trace_7", requestId: "mcp_req_arch", chamber: "response_aggregation", sequence: 7, status: "completed", durationMs: 52, summary: "Structured response aggregation completed" }
  ],
  mcpModels: [
    { id: "model_claude", provider: "anthropic", name: "Claude Sonnet", contextWindow: 200000, availabilityStatus: "active" },
    { id: "model_gpt", provider: "openai", name: "GPT reasoning", contextWindow: 128000, availabilityStatus: "active" },
    { id: "model_local", provider: "local", name: "Local evaluator", contextWindow: 32000, availabilityStatus: "disabled" }
  ],
  mcpTools: [
    { id: "tool_repo", name: "Repository Inspector", type: "github", availabilityStatus: "active", capabilities: ["repository_review", "code_search"] },
    { id: "tool_logs", name: "Log Analyzer", type: "logs", availabilityStatus: "active", capabilities: ["risk_analysis", "incident_review"] },
    { id: "tool_deploy", name: "Deployment Planner", type: "cicd", availabilityStatus: "disabled", capabilities: ["deployment_plan"] }
  ],
  mcpServers: [
    { id: "server_internal", name: "SYNASE Internal MCP", transportType: "internal", status: "active", healthStatus: "healthy", toolCount: 8 },
    { id: "server_repo", name: "Repository MCP", transportType: "https", status: "active", healthStatus: "degraded", toolCount: 4 },
    { id: "server_docs", name: "Documentation MCP", transportType: "sse", status: "discovered", healthStatus: "unknown", toolCount: 0 }
  ],
  mcpDirectories: [
    { id: "dir_internal", name: "Internal Registry", type: "internal", status: "active", healthStatus: "healthy" },
    { id: "dir_smithery", name: "Smithery", type: "smithery", status: "disabled", healthStatus: "unknown" }
  ],
  discoveryRuns: [],
  requirements: [
    { id: "REQ-001", projectId: "prj_platform", title: "Evidence-backed decision reports", type: "functional", priority: "critical", status: "approved", evidence: ["SYNASE Product Requirements.pdf", "Decision audit schema"], rationale: "Core product outcome: all conclusions must cite underlying repository or telemetry evidence.", architectureImpact: "Reporting and approval domains", provenance: "confirmed", confidence: 1 },
    { id: "REQ-002", projectId: "prj_platform", title: "Human-in-the-loop approval gate", type: "functional", priority: "high", status: "implemented", evidence: ["Governance policy v2", "Approval spec"], rationale: "High-impact recommendations must be explicitly signed off by human project leads before deployment.", architectureImpact: "Outputs approval engine and audit log", provenance: "confirmed", confidence: 1 },
    { id: "REQ-003", projectId: "prj_platform", title: "Multi-modal asset ingestion pipeline", type: "technical", priority: "high", status: "in_progress", evidence: ["Architecture review", "Upload worker specification"], rationale: "Allow code archives, PDFs, logs and spreadsheets to be normalized into searchable context chunks.", architectureImpact: "Context & ChromaDB ingestion boundary", provenance: "confirmed", confidence: 0.95 },
    { id: "REQ-014", projectId: "prj_platform", title: "Offline-safe workflow reconnect", type: "technical", priority: "high", status: "clarified", evidence: ["Workflow realtime specification"], rationale: "Preserve authoritative execution state and recover connection seamlessly over SSE.", architectureImpact: "SSE client and workflow snapshots", provenance: "confirmed", confidence: 1 },
    { id: "REQ-AI-03", projectId: "prj_platform", title: "Explain confidence contributors", type: "non_functional", priority: "medium", status: "identified", evidence: ["MCP trace fixture", "Reviewer UX study"], rationale: "Improve reviewer trust by showing factors (coverage, freshness, test signal) that form composite confidence.", architectureImpact: "Confidence explanation contract", provenance: "ai_suggested", confidence: 0.78 },
    { id: "REQ-AI-04", projectId: "prj_platform", title: "Automated dependency risk alerting", type: "security", priority: "medium", status: "identified", evidence: ["CVE scanner logs", "Dependency audit"], rationale: "Flag package lifecycle anomalies and high-severity CVEs before merging pull requests.", architectureImpact: "DevOps security findings integration", provenance: "ai_suggested", confidence: 0.82 }
  ],
  productFeatures: [
    { id: "FEAT-01", projectId: "prj_platform", title: "Decision report workspace", businessValue: 9, impact: 9, effort: 6, risk: 4, priorityRank: 1, status: "prioritized", rationale: "Primary decision-delivery surface: synthesizes findings into review-ready documents.", provenance: "confirmed" },
    { id: "FEAT-02", projectId: "prj_platform", title: "MCP trace observability", businessValue: 8, impact: 8, effort: 7, risk: 5, priorityRank: 2, status: "in_progress", rationale: "Makes AI execution reviewable across 7-stage chamber pipeline.", provenance: "confirmed" },
    { id: "FEAT-03", projectId: "prj_platform", title: "Multi-criteria Prioritization Matrix", businessValue: 8, impact: 7, effort: 5, risk: 3, priorityRank: 3, status: "candidate", rationale: "Enables engineering and product leads to calibrate value vs effort on candidate features.", provenance: "confirmed" },
    { id: "FEAT-AI-03", projectId: "prj_mcp", title: "Confidence comparison across models", businessValue: 6, impact: 7, effort: 5, risk: 3, priorityRank: 1, status: "candidate", rationale: "Useful for reviewers to evaluate model divergence on critical decisions.", provenance: "ai_suggested" },
    { id: "FEAT-AI-05", projectId: "prj_mcp", title: "Automated Scope Risk Predictor", businessValue: 7, impact: 6, effort: 6, risk: 4, priorityRank: 2, status: "candidate", rationale: "Predicts timeline slippage when incoming requirements alter architecture contracts.", provenance: "ai_suggested" }
  ],
  productStrategy: {
    prj_platform: {
      id: "strat_platform_v1",
      projectId: "prj_platform",
      objective: "Connect product intent to engineering evidence and controlled decisions without automated hallucinated execution.",
      principles: [
        "Evidence before recommendation — every decision links directly to source artifacts",
        "Human approval for impact — high-risk changes require signed intent",
        "Observable execution — all agent capabilities remain visible in MCP trace",
        "Idempotent mutations — prevent duplicate workflows or unrecorded side-effects"
      ],
      risks: [
        "Contract drift between frontend facades and mock/live adapters",
        "Overstated execution state when models generate mock receipts",
        "Ambiguity between observed repository facts and AI suggestions"
      ],
      provenance: "confirmed",
      updatedAt: "2026-09-30T10:00:00Z"
    }
  },
  roadmapItems: [
    { id: "ROAD-01", projectId: "prj_platform", milestone: "Frontend foundations & design tokens", release: "R1", sequence: 1, status: "completed", startDate: "2026-09-01", endDate: "2026-09-15", dependencies: [], featureIds: ["FEAT-01"], requirementIds: ["REQ-001"] },
    { id: "ROAD-02", projectId: "prj_platform", milestone: "Intelligence workspaces & MCP trace", release: "R2", sequence: 2, status: "active", startDate: "2026-09-16", endDate: "2026-10-15", dependencies: ["ROAD-01"], featureIds: ["FEAT-02"], requirementIds: ["REQ-002", "REQ-014"] },
    { id: "ROAD-03", projectId: "prj_platform", milestone: "Reports, approvals & audit projections", release: "R3", sequence: 3, status: "planned", startDate: "2026-10-16", endDate: "2026-11-15", dependencies: ["ROAD-02"], featureIds: ["FEAT-03"], requirementIds: ["REQ-003"] },
    { id: "ROAD-04", projectId: "prj_platform", milestone: "Autonomous validation & live transport", release: "R4", sequence: 4, status: "planned", startDate: "2026-11-16", endDate: "2026-12-31", dependencies: ["ROAD-03"], featureIds: ["FEAT-AI-03", "FEAT-AI-05"], requirementIds: ["REQ-AI-03", "REQ-AI-04"] }
  ],
  productDecisions: [
    {
      id: "DEC-PRD-01",
      projectId: "prj_platform",
      title: "Require idempotency keys on all mutating actions",
      type: "architecture_constraint",
      subjectId: "REQ-001",
      subjectType: "requirement",
      rationale: "Prevents duplicate requests during network retries or concurrent browser tabs.",
      status: "confirmed",
      provenance: "confirmed",
      confidence: 1.0,
      evidence: ["API Convention RFC", "Idempotency test suite"],
      decidedBy: "Tech Lead (Human)",
      decidedAt: "2026-09-28T14:00:00Z",
      createdAt: "2026-09-28T14:00:00Z",
      impact: "critical"
    },
    {
      id: "DEC-PRD-02",
      projectId: "prj_platform",
      title: "Visually isolate AI proposals with dedicated provenance badges",
      type: "requirement_tradeoff",
      subjectId: "REQ-AI-03",
      subjectType: "requirement",
      rationale: "Human review team must instantly distinguish authoritative facts from generated candidates.",
      status: "confirmed",
      provenance: "confirmed",
      confidence: 1.0,
      evidence: ["UX Trust Guidelines", "Audit requirement BR-02"],
      decidedBy: "Product Council",
      decidedAt: "2026-09-29T09:30:00Z",
      createdAt: "2026-09-29T09:30:00Z",
      impact: "high"
    },
    {
      id: "DEC-PRD-03",
      projectId: "prj_platform",
      title: "Sequence MCP trace observability before autonomous agent actions",
      type: "roadmap_sequence",
      subjectId: "FEAT-02",
      subjectType: "feature",
      rationale: "Verification infrastructure must precede execution capabilities to prevent unlogged actions.",
      status: "confirmed",
      provenance: "confirmed",
      confidence: 0.92,
      evidence: ["MCP V2 Runtime RFC", "ROAD-02 milestone"],
      decidedBy: "Engineering Director",
      decidedAt: "2026-09-30T11:15:00Z",
      createdAt: "2026-09-30T11:15:00Z",
      impact: "high"
    },
    {
      id: "DEC-PRD-04",
      projectId: "prj_platform",
      title: "Decline silent automatic requirement promotion",
      type: "feature_scope",
      subjectId: "REQ-AI-04",
      subjectType: "requirement",
      rationale: "AI suggested requirements remain candidates until an explicit human promotion action is recorded.",
      status: "confirmed",
      provenance: "confirmed",
      confidence: 0.88,
      evidence: ["Governance Invariant inv-22"],
      decidedBy: "Tech Lead (Human)",
      decidedAt: "2026-10-01T16:40:00Z",
      createdAt: "2026-10-01T16:40:00Z",
      impact: "medium"
    }
  ],
  devopsSummary: {
    prj_platform: { architectureScore: 0.78, qualityScore: 0.74, securityScore: 0.68, testCoverage: 0.71, deploymentReadiness: 0.64, repositoryCount: 2, provenance: "mock_analysis" }
  },
  findings: [
    { id: "FIND-SEC-01", projectId: "prj_platform", type: "security", severity: "high", title: "Secret-scan policy is not frozen", evidence: "Auth/RBAC and ingestion specifications", affectedLocation: "Upload and integration boundary", status: "open" },
    { id: "FIND-ARCH-02", projectId: "prj_platform", type: "architecture", severity: "medium", title: "Global routes depend on project-scoped APIs", evidence: "Page → API Matrix", affectedLocation: "Reports, approvals, integrations", status: "acknowledged" },
    { id: "FIND-TEST-03", projectId: "prj_platform", type: "testing", severity: "low", title: "Contract coverage lacks live-backend fixtures", evidence: "Mock contract suite", affectedLocation: "Integration tests", status: "in_progress" }
  ],
  devopsRecommendations: [
    { id: "REC-01", projectId: "prj_platform", type: "security", title: "Freeze signed-upload redaction policy", priority: "high", status: "proposed", approvalStatus: "pending", rationale: "Prevents credential exposure in diagnostics.", executed: false },
    { id: "REC-02", projectId: "prj_platform", type: "testing", title: "Add backend DTO conformance suite", priority: "medium", status: "proposed", approvalStatus: "not_required", rationale: "Reduces integration drift.", executed: false }
  ],
  dependencies: [
    { id: "DEP-01", projectId: "prj_platform", name: "TanStack Query", category: "frontend", currentVersion: "TBD", risk: "low", status: "unresolved_contract" },
    { id: "DEP-02", projectId: "prj_platform", name: "Auth provider", category: "security", currentVersion: "TBD", risk: "high", status: "decision_required" }
  ],
  testSuggestions: [
    { id: "TEST-01", projectId: "prj_platform", title: "SSE replay and dedupe integration test", type: "integration", priority: "high", status: "suggested" },
    { id: "TEST-02", projectId: "prj_platform", title: "Credential-redaction regression suite", type: "security", priority: "critical", status: "planned" }
  ],
  deploymentPlans: [
    { id: "PLAN-01", projectId: "prj_platform", title: "Frontend staging rollout", status: "proposed", approvalRequired: true, executed: false, steps: [
      { sequence: 1, type: "build", title: "Build immutable frontend artifact", status: "proposed" },
      { sequence: 2, type: "test", title: "Run contract and accessibility gates", status: "proposed" },
      { sequence: 3, type: "deploy", title: "Deploy to staging after approval", status: "proposed" }
    ] }
  ],
  contextItems: [
    { id: "ctx_prd", projectId: "prj_platform", title: "Product requirements", type: "document", source: "asset_prd", scope: "project", sensitivity: "internal", trustLevel: "verified", status: "ready", updatedAt: "2026-09-29T06:10:00Z" },
    { id: "ctx_repo", projectId: "prj_platform", title: "Frontend repository snapshot", type: "repository", source: "repo_core", scope: "project", sensitivity: "restricted", trustLevel: "source_controlled", status: "ready", updatedAt: "2026-09-29T07:42:00Z" },
    { id: "ctx_logs", projectId: "prj_platform", title: "Deployment error log", type: "log", source: "asset_logs", scope: "request", sensitivity: "confidential", trustLevel: "unverified", status: "warning", updatedAt: "2026-09-28T20:02:00Z" }
  ],
  memoryItems: [
    { id: "mem_1", projectId: "prj_platform", title: "Evidence before recommendation", excerpt: "Every decision must preserve evidence, confidence, and provenance.", sourceContextId: "ctx_prd", relevance: 0.96, sensitivity: "internal", trustLevel: "verified" },
    { id: "mem_2", projectId: "prj_platform", title: "Frontend/backend boundary", excerpt: "The browser consumes domain APIs and never reads persistence stores directly.", sourceContextId: "ctx_prd", relevance: 0.91, sensitivity: "internal", trustLevel: "verified" },
    { id: "mem_3", projectId: "prj_platform", title: "Deployment warning pattern", excerpt: "Recent logs contain retry exhaustion during artifact promotion.", sourceContextId: "ctx_logs", relevance: 0.74, sensitivity: "confidential", trustLevel: "unverified" }
  ],
  retrievalHistory: [
    { id: "ret_1", projectId: "prj_platform", query: "architecture evidence and API boundaries", status: "completed", createdAt: "2026-09-29T08:44:00Z", items: [
      { memoryId: "mem_2", rank: 1, score: 0.94, reason: "Direct API-boundary match" },
      { memoryId: "mem_1", rank: 2, score: 0.82, reason: "Decision-evidence principle" }
    ] },
    { id: "ret_2", projectId: "prj_platform", query: "deployment risk", status: "completed", createdAt: "2026-09-28T14:20:00Z", items: [
      { memoryId: "mem_3", rank: 1, score: 0.88, reason: "Relevant deployment log evidence" }
    ] }
  ],
  knowledgeGraphs: {
    prj_platform: {
      projectId: "prj_platform",
      status: "ready",
      lastSyncedAt: "2026-09-29T08:10:00Z",
      storageBoundary: "Neo4j is backend-only; this response is a safe domain projection.",
      nodes: [
        { id: "node_project", type: "project", label: "SYNASE Platform", sensitivity: "internal" },
        { id: "node_prd", type: "document", label: "Product Requirements", sensitivity: "internal" },
        { id: "node_repo", type: "repository", label: "synase-platform", sensitivity: "restricted" },
        { id: "node_decision", type: "decision", label: "API-driven frontend", sensitivity: "internal" }
      ],
      edges: [
        { id: "edge_1", sourceId: "node_project", targetId: "node_prd", type: "uses" },
        { id: "edge_2", sourceId: "node_project", targetId: "node_repo", type: "implemented_by" },
        { id: "edge_3", sourceId: "node_prd", targetId: "node_decision", type: "supports" }
      ]
    }
  },
  reports: [
    {
      id: "rpt_arch_01", projectId: "prj_platform", workflowId: "wf_mock_arch",
      title: "Architecture Review — Frontend Boundaries", type: "architecture_review",
      version: 3, status: "review_required", summary: "The API-driven frontend boundary is sound; route scope and publication controls still require explicit decisions.",
      confidence: 0.87, approvalStatus: "pending", createdAt: "2026-09-29T08:50:00Z", updatedAt: "2026-09-29T09:12:00Z",
      sections: [
        { id: "sec_summary", title: "Executive summary", sequence: 1, content: "Keep frontend pages dependent on domain contracts and safe projections rather than persistence models." },
        { id: "sec_findings", title: "Key findings", sequence: 2, content: "Project scope is reliable in adapters, while global report and approval routes still lack aggregate contracts." },
        { id: "sec_actions", title: "Recommended actions", sequence: 3, content: "Freeze project/global route semantics and require authoritative receipts for publication and approval actions." }
      ],
      references: [
        { id: "ref_prd", label: "Product Requirements", sourceType: "context", sourceId: "ctx_prd", trustLevel: "verified" },
        { id: "ref_matrix", label: "Page → API Matrix", sourceType: "document", sourceId: "ctx_prd", trustLevel: "verified" }
      ],
      decisions: [
        { id: "dec_api", title: "Preserve domain-oriented API boundary", status: "recommended", impact: "high", rationale: "Prevents database coupling and integration rework.", provenance: "ai_suggested", confidence: 0.9, executed: false },
        { id: "dec_scope", title: "Use selected project context for provisional global routes", status: "requires_approval", impact: "medium", rationale: "Aggregate endpoints are not contracted.", provenance: "ai_suggested", confidence: 0.78, executed: false }
      ]
    },
    {
      id: "rpt_risk_02", projectId: "prj_platform", workflowId: "wf_mock_risk",
      title: "Release Risk Assessment", type: "risk_assessment", version: 1, status: "draft",
      summary: "Release evidence is incomplete; no deployment recommendation is approved.", confidence: 0.68,
      approvalStatus: "not_requested", createdAt: "2026-09-28T14:30:00Z", updatedAt: "2026-09-28T14:42:00Z",
      sections: [{ id: "sec_risk", title: "Risk summary", sequence: 1, content: "The available deployment log contains retry exhaustion and requires human review." }],
      references: [{ id: "ref_logs", label: "Deployment error log", sourceType: "context", sourceId: "ctx_logs", trustLevel: "unverified" }],
      decisions: [{ id: "dec_hold", title: "Hold deployment recommendation", status: "recommended", impact: "critical", rationale: "Evidence is incomplete.", provenance: "ai_suggested", confidence: 0.72, executed: false }]
    }
  ],
  approvals: [
    {
      id: "apr_report_01", projectId: "prj_platform", reportId: "rpt_arch_01", type: "report_publication",
      title: "Publish architecture review", status: "pending", requestedBy: "SYNASE mock workflow",
      requestedAt: "2026-09-29T09:12:00Z", expiresAt: "2026-10-06T09:12:00Z",
      rationale: "Publication makes the report available as confirmed project state.", risk: "medium",
      allowedActions: ["approve", "reject", "comment", "cancel"], executed: false,
      comments: [{ id: "cmt_1", author: "Maya Chen", text: "Confirm route scope before publication.", createdAt: "2026-09-29T09:20:00Z" }]
    },
    {
      id: "apr_deploy_02", projectId: "prj_platform", reportId: "rpt_risk_02", type: "deployment_change",
      title: "Approve frontend staging rollout", status: "pending", requestedBy: "SYNASE mock workflow",
      requestedAt: "2026-09-28T15:00:00Z", expiresAt: "2026-10-05T15:00:00Z",
      rationale: "High-impact deployment plan requires an authorized human decision.", risk: "critical",
      allowedActions: ["approve", "reject", "comment", "cancel"], executed: false, comments: []
    }
  ],
  exportArtifacts: [],

  /* ── Chat & Work surface ──────────────────────────────────────────
     Every assistant reply here is a deterministic mock draft. Nothing in
     this table is the result of a model call, a tool call, or a real
     artifact. externalContacted and downstreamExecuted stay false so the
     platform's safety invariants continue to hold. */

  workSessions: [
    {
      id: "wrk_prioritise", projectId: "prj_platform",
      title: "Prioritise Q4 platform requirements", status: "active",
      mode: "work", layer: "product", capability: "", effort: "high",
      createdAt: "2026-09-30T09:12:00Z", updatedAt: "2026-09-30T09:41:00Z", mock: true
    },
    {
      id: "wrk_deployrisk", projectId: "prj_platform",
      title: "Staging deployment risk review", status: "active",
      mode: "work", layer: "devops", capability: "", effort: "max",
      createdAt: "2026-09-29T16:05:00Z", updatedAt: "2026-09-29T16:22:00Z", mock: true
    },
    {
      id: "wrk_archdoc", projectId: "prj_platform",
      title: "Draft the gateway architecture note", status: "active",
      mode: "work", layer: "", capability: "code", effort: "medium",
      createdAt: "2026-09-28T11:30:00Z", updatedAt: "2026-09-28T11:44:00Z", mock: true
    },
    {
      id: "wrk_research", projectId: "prj_platform",
      title: "Research competitor onboarding", status: "archived",
      mode: "chat", layer: "", capability: "text", effort: "auto",
      createdAt: "2026-09-27T08:00:00Z", updatedAt: "2026-09-27T08:02:00Z", mock: true
    }
  ],

  workMessages: [
    {
      id: "wmsg_01", sessionId: "wrk_prioritise", role: "user",
      text: "Which Q4 requirements should we build first if delivery capacity is four engineers?",
      createdAt: "2026-09-30T09:12:00Z", status: "accepted", mock: true
    },
    {
      id: "wmsg_02", sessionId: "wrk_prioritise", role: "assistant",
      text: "Mock draft — no model was called. Ranking the twelve open requirements by business value against delivery risk puts four in the build band. The scored table and the rejected candidates are in the attached artifact, clearly separated from confirmed project state.",
      createdAt: "2026-09-30T09:41:00Z", status: "accepted", mock: true,
      layer: "product", effort: "high", artifactId: "wart_prioritise"
    },
    {
      id: "wmsg_03", sessionId: "wrk_deployrisk", role: "user",
      text: "Walk me through the staging rollout risk before Friday.",
      createdAt: "2026-09-29T16:05:00Z", status: "accepted", mock: true
    },
    {
      id: "wmsg_04", sessionId: "wrk_deployrisk", role: "assistant",
      text: "Mock draft — no deployment was planned or executed. Three open findings and one unapproved change gate the rollout. The review checklist is attached as an artifact.",
      createdAt: "2026-09-29T16:22:00Z", status: "accepted", mock: true,
      layer: "devops", effort: "max", artifactId: "wart_deployrisk"
    },
    {
      id: "wmsg_05", sessionId: "wrk_archdoc", role: "user",
      text: "Sketch the API gateway boundary for the platform service.",
      createdAt: "2026-09-28T11:30:00Z", status: "accepted", mock: true
    },
    {
      id: "wmsg_06", sessionId: "wrk_archdoc", role: "assistant",
      text: "Mock draft — no code was generated or written anywhere. The proposed boundary and its open questions are in the attached artifact for a human to review.",
      createdAt: "2026-09-28T11:44:00Z", status: "accepted", mock: true,
      capability: "code", effort: "medium", artifactId: "wart_archdoc"
    },
    {
      id: "wmsg_07", sessionId: "wrk_research", role: "user",
      text: "How do comparable platforms handle first-run onboarding?",
      createdAt: "2026-09-27T08:00:00Z", status: "accepted", mock: true
    }
  ],

  workArtifacts: [
    {
      id: "wart_prioritise", sessionId: "wrk_prioritise", messageId: "wmsg_02",
      kind: "report", title: "Q4 requirement scoring (mock draft)", language: "markdown",
      provenance: "ai_suggested", confidence: 0.72,
      createdAt: "2026-09-30T09:41:00Z", updatedAt: "2026-09-30T09:41:00Z", mock: true,
      content: "# Q4 requirement scoring (mock draft)\n\nDeterministic fixture. No ranking engine ran.\n\n| Requirement | Value | Risk | Band |\n| --- | --- | --- | --- |\n| Multi-tenant billing isolation | 5 | 4 | build |\n| Repository context ingestion | 5 | 3 | build |\n| Report approval checkpoints | 4 | 2 | build |\n| MCP directory discovery UI | 3 | 3 | build |\n| Workflow replay timeline | 3 | 4 | defer |\n| Multi-region deploy targets | 2 | 5 | defer |\n\n## Open questions\n\n- Capacity assumption is unverified; four engineers was supplied in chat, not confirmed.\n- Value and risk scores are fixture values, not measured outcomes.\n- Nothing here is approved. Route through the approvals queue to record a human decision."
    },
    {
      id: "wart_deployrisk", sessionId: "wrk_deployrisk", messageId: "wmsg_04",
      kind: "report", title: "Staging rollout review (mock draft)", language: "markdown",
      provenance: "ai_suggested", confidence: 0.64,
      createdAt: "2026-09-29T16:22:00Z", updatedAt: "2026-09-29T16:22:00Z", mock: true,
      content: "# Staging rollout review (mock draft)\n\nNo deployment step was planned, approved, or executed.\n\n## Blocking\n\n1. FIND-SEC-01 — secret-scan policy is not implemented.\n2. Deployment plan apr_deploy_02 is still pending human approval.\n3. Three integration providers are unavailable in the fixture set.\n\n## Required before execution\n\n- A named approver records a decision in the approvals queue.\n- Connection, authorization, and health are verified per provider.\n- The signed-upload contract is resolved.\n\nExecuted: No."
    },
    {
      id: "wart_archdoc", sessionId: "wrk_archdoc", messageId: "wmsg_06",
      kind: "spec", title: "API gateway boundary (mock draft)", language: "markdown",
      provenance: "ai_suggested", confidence: 0.58,
      createdAt: "2026-09-28T11:44:00Z", updatedAt: "2026-09-28T11:44:00Z", mock: true,
      content: "# API gateway boundary (mock draft)\n\nProposal only. No code was generated, written, or deployed.\n\n- North-south traffic terminates at the gateway; domain services stay internal.\n- Authentication resolves to a session before routing, never after.\n- Every forwarded request carries a correlation id that survives into audit.\n- Rate limits are declared per domain service, not globally.\n\n## Unresolved\n\n- The authentication and session contract is not frozen.\n- Active workspace/project context encoding is undefined.\n- No server exists in this repository to route to."
    }
  ],

  // ── Settings Control Plane Fixtures ──
  settingsValues: [
    { definitionId: "general.profile_name", scope: "user", scopeId: "usr_satyam", value: "Alex Turner", version: 1, updatedAt: "2026-09-29T08:00:00Z", updatedBy: "usr_satyam" },
    { definitionId: "general.timezone", scope: "workspace", scopeId: "ws_synase", value: "America/New_York", version: 2, updatedAt: "2026-09-29T08:00:00Z", updatedBy: "usr_satyam" },
    { definitionId: "ai.default_model", scope: "workspace", scopeId: "ws_synase", value: "gemini-1.5-pro", version: 1, updatedAt: "2026-09-29T08:00:00Z", updatedBy: "usr_satyam" },
    { definitionId: "ai.temperature", scope: "project", scopeId: "prj_platform", value: 0.15, version: 1, updatedAt: "2026-09-29T08:00:00Z", updatedBy: "usr_satyam" },
    { definitionId: "agents.autonomy_level", scope: "workspace", scopeId: "ws_synase", value: "supervised", version: 1, updatedAt: "2026-09-29T08:00:00Z", updatedBy: "usr_satyam" },
    { definitionId: "memory.enabled", scope: "workspace", scopeId: "ws_synase", value: true, version: 1, updatedAt: "2026-09-29T08:00:00Z", updatedBy: "usr_satyam" },
    { definitionId: "tools.shell_execution", scope: "workspace", scopeId: "ws_synase", value: "ask", version: 1, updatedAt: "2026-09-29T08:00:00Z", updatedBy: "usr_satyam" },
    { definitionId: "appearance.theme", scope: "user", scopeId: "usr_satyam", value: "dark", version: 1, updatedAt: "2026-09-29T08:00:00Z", updatedBy: "usr_satyam" }
  ],

  apiKeys: [
    { id: "key_prod_01", name: "CI Pipeline Scanner", prefix: "syn_live_9f8a", scopes: ["analysis:read", "workflows:run"], createdAt: "2026-09-15T10:00:00Z", lastUsedAt: "2026-10-05T18:22:00Z", status: "active" },
    { id: "key_dev_02", name: "Local IDE Subagent", prefix: "syn_test_3b1c", scopes: ["*"], createdAt: "2026-09-20T14:12:00Z", lastUsedAt: "2026-10-04T09:15:00Z", status: "active" },
    { id: "key_dep_03", name: "Legacy Webhook Ingestion", prefix: "syn_live_00ad", scopes: ["inputs:upload"], createdAt: "2026-08-01T08:00:00Z", lastUsedAt: null, status: "revoked" }
  ],

  settingsConnectors: [
    { id: "conn_gh", provider: "GitHub", name: "satyam022028singh/Synase-ai", kind: "oauth", status: "connected", lastSyncAt: "2026-10-05T19:30:00Z", syncInterval: "15m", scopes: ["repo:read", "pull_requests:read"] },
    { id: "conn_jira", provider: "Jira Software", name: "Atlassian Cloud (PROD)", kind: "oauth", status: "connected", lastSyncAt: "2026-10-05T19:00:00Z", syncInterval: "30m", scopes: ["issues:read", "projects:read"] },
    { id: "conn_linear", provider: "Linear", name: "Core Engineering Workspace", kind: "api_key", status: "reauth_required", lastSyncAt: "2026-10-01T12:00:00Z", syncInterval: "1h", scopes: ["issues:all"] },
    { id: "conn_slack", provider: "Slack", name: "Engineering Alert Mesh", kind: "webhook", status: "connected", lastSyncAt: "2026-10-05T18:45:00Z", syncInterval: "realtime", scopes: ["chat:write"] }
  ],

  settingsAutomations: [
    { id: "auto_arch_review", title: "Nightly Architecture Review", trigger: "cron: 0 2 * * *", action: "devops:architecture:analyze", schedule: "Daily at 02:00 UTC", status: "active", lastRunAt: "2026-10-05T02:00:00Z" },
    { id: "auto_sec_scan", title: "Continuous Dependency Vulnerability Scan", trigger: "event: repository:push", action: "devops:dependencies:analyze", schedule: "On Git Push", status: "active", lastRunAt: "2026-10-05T19:25:00Z" },
    { id: "auto_req_sync", title: "Bi-Weekly PRD Requirement Resync", trigger: "cron: 0 0 1,15 * *", action: "product:requirements:analyze", schedule: "1st & 15th of month", status: "paused", lastRunAt: "2026-09-15T00:00:00Z" }
  ],

  agentPolicy: {
    autonomy: "supervised",
    confirmation: "sensitive_only",
    toolRules: [
      { toolId: "tools.shell_execution", effect: "ask" },
      { toolId: "tools.file_mutation", effect: "ask" },
      { toolId: "tools.git_push", effect: "deny" }
    ],
    maxActionChain: 25,
    allowExternalSideEffects: false
  },

  providers: [
    { id: "prov_gemini", name: "Google Gemini", status: "active", latencyMs: 340, tier: "primary", models: ["gemini-1.5-pro", "gemini-1.5-flash"] },
    { id: "prov_anthropic", name: "Anthropic Claude", status: "active", latencyMs: 520, tier: "fallback", models: ["claude-3-5-sonnet", "claude-3-haiku"] },
    { id: "prov_openai", name: "OpenAI", status: "active", latencyMs: 410, tier: "secondary", models: ["gpt-4o", "gpt-4o-mini"] },
    { id: "prov_local", name: "Local Ollama", status: "standby", latencyMs: 80, tier: "private", models: ["llama3:8b", "mistral:7b"] }
  ],

  usageSummary: {
    period: "October 2026",
    tokensConsumed: 12450890,
    monthlyQuota: 50000000,
    quotaPercent: 24.9,
    estimatedCostUsd: 48.25,
    budgetCeilingUsd: 200.00,
    activeSubagents: 3,
    totalWorkflowsRun: 184
  }
};

export function page(data) {
  return { data, meta: { page: 1, pageSize: 25, total: data.length } };
}
