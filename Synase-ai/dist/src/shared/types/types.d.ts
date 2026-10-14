export type PlatformRole = "platform_admin" | "member" | "support";
export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";
export type ProjectRole = "owner" | "product_manager" | "developer" | "devops_engineer" | "reviewer" | "viewer";
export type ProjectLifecycleStatus = "draft" | "active" | "paused" | "completed" | "archived";

export interface ApiSuccess<T> { data: T }
export interface PageMeta { page: number; pageSize: number; total: number }
export interface ApiList<T> { data: T[]; meta: PageMeta }
export interface ApiErrorShape {
  code: string;
  message: string;
  details: Record<string, unknown>;
  requestId?: string;
  status?: number;
}
export interface User {
  id: string;
  email: string;
  displayName: string;
  globalRole: PlatformRole;
  avatarUrl?: string;
}
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  role: WorkspaceRole;
  status: "active" | "suspended" | "archived";
}
export interface WorkspaceMember {
  userId: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  joinedAt: string;
}
export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description?: string;
  goal?: string;
  lifecycleStatus: ProjectLifecycleStatus;
  role: ProjectRole;
  updatedAt: string;
}
export interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  role: ProjectRole;
}
export interface DashboardMetric {
  label: string;
  value: string;
  trend?: string;
  tone?: "neutral" | "positive" | "warning" | "danger";
}
export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  occurredAt: string;
}
export type RepositoryProvider = "github" | "gitlab" | "bitbucket" | "local" | "other";
export type RepositoryConnectionStatus = "pending" | "connected" | "error" | "revoked";
export interface Repository {
  id: string;
  projectId: string;
  provider: RepositoryProvider;
  name: string;
  fullName: string;
  defaultBranch: string;
  visibility: "public" | "private" | "internal" | "unknown";
  connectionStatus: RepositoryConnectionStatus;
  lastSyncedAt?: string;
}
export interface RepositorySnapshot {
  id: string;
  repositoryId: string;
  commitSha: string;
  branch: string;
  fileCount: number;
  totalBytes: number;
  scanStatus: "pending" | "running" | "completed" | "failed";
  createdAt: string;
}
export type InputType = "text" | "file" | "csv" | "spreadsheet" | "pdf" | "document" | "image" | "audio" | "video" | "url" | "repository" | "connector" | "code_archive" | "log";
export type InputProcessingStatus = "received" | "scanning" | "extracting" | "indexing" | "ready" | "warning" | "failed" | "deleted";
export type SecurityScanStatus = "pending" | "clean" | "warning" | "blocked" | "failed";
export type ExtractionStatus = "not_started" | "running" | "completed" | "partial" | "failed";
export interface Asset {
  id: string;
  projectId: string;
  name: string;
  inputType: InputType;
  sourceType: "upload" | "paste" | "drag_drop" | "github" | "gitlab" | "url" | "integration" | "generated_context";
  mimeType?: string;
  byteSize?: number;
  processingStatus: InputProcessingStatus;
  securityScanStatus: SecurityScanStatus;
  extractionStatus: ExtractionStatus;
  createdAt: string;
}
export interface UploadInitiationResponse {
  assetId: string;
  upload: { method: "PUT"; url: string; expiresAt: string; headers: Record<string, string> };
}
export type ConversationStatus = "active" | "archived" | "deleted";
export type MessageRole = "user" | "assistant" | "system" | "tool";
export type MessageStatus = "draft" | "submitted" | "processing" | "completed" | "failed" | "deleted";
export interface ConversationSession {
  id: string;
  projectId: string;
  title?: string;
  status: ConversationStatus;
  updatedAt: string;
}
export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  text?: string;
  status: MessageStatus;
  assetIds: string[];
  repositoryIds: string[];
  createdAt: string;
  mock?: boolean;
}
export type AnalysisPriority = "low" | "normal" | "high" | "urgent";
export type ExecutionStrategy = "sequential" | "parallel" | "hybrid";
export type AnalysisRequestStatus = "received" | "validated" | "rejected" | "queued" | "processing" | "completed" | "failed" | "cancelled";
export interface AnalysisRequest {
  id: string;
  projectId: string;
  conversationId?: string;
  requestText: string;
  requestType: string;
  priority: AnalysisPriority;
  executionStrategy: ExecutionStrategy;
  assetIds: string[];
  repositoryIds: string[];
  status: AnalysisRequestStatus;
  workflowId?: string;
  traceId?: string;
  createdAt: string;
}
export type WorkflowStatus = "created" | "queued" | "running" | "waiting" | "completed" | "failed" | "cancelled" | "paused";
export type TaskStatus = "pending" | "ready" | "running" | "waiting" | "completed" | "failed" | "skipped" | "cancelled";
export interface WorkflowRun {
  id: string;
  projectId: string;
  requestId: string;
  executionStrategy: ExecutionStrategy;
  status: WorkflowStatus;
  progressPercent: number;
  currentStage?: string;
  createdAt: string;
  updatedAt: string;
}
export interface WorkflowTask {
  id: string;
  workflowId: string;
  name: string;
  layer: "product" | "devops" | "orchestrator" | "mcp" | "reporting";
  status: TaskStatus;
  progressPercent: number;
  sequence: number;
}
export interface WorkflowEvent<T = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  workflowId: string;
  occurredAt: string;
  sequence: number;
  schemaVersion: "1";
  payload: T;
}
export interface McpRequest {
  id: string;
  workflowId?: string;
  detectedLayer?: "product" | "devops" | "both" | "unknown";
  status: "received" | "processing" | "completed" | "failed" | "cached" | "validated";
  payloadFormat: "json" | "toon" | "reference";
  createdAt: string;
}
export interface McpTraceStage {
  id: string;
  requestId: string;
  chamber: string;
  sequence: number;
  status: "queued" | "running" | "completed" | "failed" | "skipped" | "cached";
  durationMs?: number;
  summary: string;
}
export interface McpModel {
  id: string;
  provider: string;
  name: string;
  contextWindow?: number;
  availabilityStatus: "active" | "disabled" | "deprecated";
}
export interface McpTool {
  id: string;
  name: string;
  type: string;
  availabilityStatus: "active" | "disabled" | "deprecated";
}
export interface McpServer {
  id: string;
  name: string;
  transportType: string;
  status: "discovered" | "registered" | "active" | "disabled" | "error" | "deprecated";
  healthStatus: "unknown" | "healthy" | "degraded" | "unavailable";
}
export interface Requirement {
  id: string; projectId: string; title: string; type: string;
  priority: "critical" | "high" | "medium" | "low" | "deferred";
  status: "identified" | "clarified" | "approved" | "in_progress" | "implemented" | "validated" | "rejected" | "archived";
  evidence: string[]; rationale?: string; architectureImpact?: string;
  provenance: "confirmed" | "ai_suggested"; confidence?: number;
}
export interface ProductFeature {
  id: string; projectId: string; title: string; businessValue: number; impact: number;
  effort: number; risk: number; priorityRank: number; status: string; rationale: string;
  provenance: "confirmed" | "ai_suggested";
}
export interface ProductStrategy {
  id?: string;
  projectId: string;
  objective: string;
  principles: string[];
  risks: string[];
  provenance: "confirmed" | "ai_suggested";
  updatedAt?: string;
}
export interface ProductDecision {
  id: string;
  projectId: string;
  title: string;
  type: "requirement_scope" | "prioritization" | "architecture_gate" | "release_sequencing" | "tradeoff";
  subjectId: string;
  subjectType: "requirement" | "feature" | "strategy" | "roadmap_item";
  rationale: string;
  status: "proposed" | "confirmed" | "deferred" | "rejected";
  provenance: "confirmed" | "ai_suggested";
  confidence?: number;
  evidence: string[];
  createdAt: string;
  impact: "critical" | "high" | "medium" | "low";
}
export interface ProductOverview {
  totalRequirements: number;
  approvedRequirements: number;
  suggestedRequirements: number;
  prioritizedFeatures: number;
  activeMilestone: string;
  roadmapProgress: number;
  requirementsCoverage: number;
  topRisksCount: number;
}
export interface RoadmapItem {
  id: string; projectId: string; milestone: string; release: string; sequence: number;
  status: "planned" | "active" | "completed" | "delayed" | "cancelled";
  startDate?: string; endDate?: string; dependencies: string[];
  featureIds?: string[];
  requirementIds?: string[];
}
export interface Finding {
  id: string; projectId: string; type: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string; evidence: string; affectedLocation?: string;
  status: "open" | "acknowledged" | "in_progress" | "resolved" | "accepted" | "false_positive" | "closed";
}
export interface DevOpsRecommendation {
  id: string; projectId: string; type: string; title: string; priority: string;
  status: string; approvalStatus: "not_required" | "pending" | "approved" | "rejected";
  rationale: string; executed: false;
}
export interface DeploymentPlan {
  id: string; projectId: string; title: string;
  status: "proposed" | "reviewed" | "approved" | "rejected" | "implemented";
  approvalRequired: boolean; executed: false;
}
export type ContextSensitivity = "public" | "internal" | "restricted" | "confidential";
export type ContextTrustLevel = "verified" | "source_controlled" | "unverified";
export interface ContextItem {
  id: string; projectId: string; title: string; type: string; source: string;
  scope: "workspace" | "project" | "request"; sensitivity: ContextSensitivity;
  trustLevel: ContextTrustLevel; status: "ready" | "warning" | "failed"; updatedAt: string;
}
export interface MemoryResult {
  id: string; projectId: string; title: string; excerpt: string; sourceContextId: string;
  relevance: number; sensitivity: ContextSensitivity; trustLevel: ContextTrustLevel;
}
export interface RetrievalItem { memoryId: string; rank: number; score: number; reason: string }
export interface RetrievalRecord {
  id: string; projectId: string; query: string; status: "completed" | "failed";
  createdAt: string; items: RetrievalItem[];
}
export interface KnowledgeNode { id: string; type: string; label: string; sensitivity: ContextSensitivity }
export interface KnowledgeEdge { id: string; sourceId: string; targetId: string; type: string }
export interface KnowledgeGraph {
  projectId: string; status: "ready" | "syncing" | "warning" | "failed"; lastSyncedAt?: string;
  storageBoundary: string; nodes: KnowledgeNode[]; edges: KnowledgeEdge[];
}
export type ReportStatus = "queued" | "generating" | "draft" | "review_required" | "approved" | "published" | "failed" | "archived";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired" | "cancelled";
export type ApprovalType = "code_change" | "pull_request" | "ci_cd_change" | "deployment_change" | "high_risk_recommendation" | "report_publication" | "other";
export interface ReportSection { id: string; title: string; sequence: number; content: string }
export interface ReportReference { id: string; label: string; sourceType: string; sourceId: string; trustLevel: ContextTrustLevel }
export interface DecisionItem {
  id: string; title: string; status: "recommended" | "requires_approval" | "confirmed" | "rejected";
  impact: "critical" | "high" | "medium" | "low"; rationale: string;
  provenance: "confirmed" | "ai_suggested"; confidence: number; executed: false;
}
export interface DecisionReport {
  id: string; projectId: string; workflowId?: string; title: string; type: string;
  version: number; status: ReportStatus; summary: string; confidence: number;
  approvalStatus: ApprovalStatus | "not_requested"; createdAt: string; updatedAt: string;
  sections: ReportSection[]; references: ReportReference[]; decisions: DecisionItem[];
}
export interface ApprovalComment { id: string; author: string; text: string; createdAt: string; mock?: boolean }
export interface Approval {
  id: string; projectId: string; reportId?: string; type: ApprovalType; title: string;
  status: ApprovalStatus; requestedBy: string; requestedAt: string; expiresAt?: string;
  rationale: string; risk: "critical" | "high" | "medium" | "low";
  allowedActions: Array<"approve" | "reject" | "comment" | "cancel">;
  executed: false; comments: ApprovalComment[];
}
export interface ReportExportArtifact {
  id: string; reportId: string; format: "pdf" | "docx" | "json";
  status: "queued" | "mock_ready" | "ready" | "failed"; downloadUrl: string | null;
  expiresAt: string | null; mock?: boolean;
}
export interface DomainApi {
  getMe(): Promise<ApiSuccess<User>>;
  listWorkspaces(): Promise<ApiList<Workspace>>;
  listProjects(workspaceId: string): Promise<ApiList<Project>>;
  createProject(input: Pick<Project, "workspaceId" | "name"> & Partial<Project>): Promise<ApiSuccess<Project>>;
  listRepositories(projectId: string): Promise<ApiList<Repository>>;
  listAssets(projectId: string): Promise<ApiList<Asset>>;
  listConversations(projectId: string): Promise<ApiList<ConversationSession>>;
  listAnalysisRequests(projectId: string): Promise<ApiList<AnalysisRequest>>;
}

export type SettingsScope = 'system' | 'workspace' | 'project' | 'agent' | 'task' | 'session' | 'user';
export type SettingsSensitivity = 'public' | 'internal' | 'sensitive' | 'secret';

export type SettingsSection =
  | 'general'
  | 'ai-models'
  | 'agents'
  | 'memory'
  | 'tools'
  | 'connectors'
  | 'messaging'
  | 'vault'
  | 'developer'
  | 'automations'
  | 'usage'
  | 'security'
  | 'workspace'
  | 'appearance'
  | 'data'
  | 'advanced';

export interface SettingDefinition<T = unknown> {
  id: string;
  section: SettingsSection;
  label: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'enum' | 'object' | 'list';
  default: T;
  allowedScopes: SettingsScope[];
  sensitivity: SettingsSensitivity;
  schemaVersion: number;
  options?: Array<{ label: string; value: string | number }>;
  permission?: string;
  resettable?: boolean;
}

export interface SettingValue<T = unknown> {
  definitionId: string;
  scope: SettingsScope;
  scopeId: string;
  value: T;
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface EffectiveSetting<T = unknown> {
  id: string;
  definition: SettingDefinition<T>;
  value: T;
  sourceScope: SettingsScope;
  sourceId: string;
  isOverridden: boolean;
  constrainedByPolicy: boolean;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  status: 'active' | 'revoked';
}

export interface ConnectorItem {
  id: string;
  provider: string;
  name: string;
  kind: 'oauth' | 'api_key' | 'webhook';
  status: 'connected' | 'reauth_required' | 'disconnected';
  lastSyncAt: string | null;
  syncInterval: string;
  scopes: string[];
}

export interface AutomationItem {
  id: string;
  title: string;
  trigger: string;
  action: string;
  schedule: string;
  status: 'active' | 'paused';
  lastRunAt: string | null;
}