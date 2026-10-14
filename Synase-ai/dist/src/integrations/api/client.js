// @ts-check
export class Phase11ApiError extends Error {
  constructor(code, message, status = 500) {
    super(message); this.name = "Phase11ApiError"; this.code = code; this.status = status;
    this.requestId = `req_p11_${Math.random().toString(36).slice(2, 10)}`;
  }
}
const clone = structuredClone;
const page = (data) => ({ data: clone(data), meta: { page: 1, pageSize: 25, total: data.length } });
const receipts = new Map();
const secretKey = /authorization|cookie|credential|password|secret|token|api[_-]?key|private[_-]?key|client[_-]?secret/i;
const payloadKey = /request(body|payload)|response(body|payload)|raw(body|payload)|headers/i;
export function redactSensitiveMetadata(value, seen = new WeakSet()) {
  if (Array.isArray(value)) return value.map((item) => redactSensitiveMetadata(item, seen));
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return "[CIRCULAR]"; seen.add(value);
  return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key,
    secretKey.test(key) ? "[REDACTED]" : payloadKey.test(key) ? "[OMITTED]" : redactSensitiveMetadata(nested, seen)
  ]));
}
const providers = [
  { id: "provider_github", name: "GitHub", category: "source_control", availabilityStatus: "available", capabilities: ["repository_metadata", "pull_request_context", "issue_context"], authorizationMethod: "oauth", mock: true },
  { id: "provider_jira", name: "Jira", category: "product_delivery", availabilityStatus: "available", capabilities: ["issue_context", "project_metadata"], authorizationMethod: "oauth", mock: true },
  { id: "provider_slack", name: "Slack", category: "collaboration", availabilityStatus: "planned", capabilities: ["channel_context"], authorizationMethod: "oauth", mock: true }
];
const connections = [
  { id: "int_github", projectId: "prj_platform", providerId: "provider_github", displayName: "SYNASE GitHub", authorizationStatus: "authorized", connectionStatus: "connected", health: { status: "healthy", checkedAt: "2026-09-29T09:32:00Z", message: "Mock health projection" }, syncStatus: "succeeded", lastSyncedAt: "2026-09-29T09:20:00Z", capabilities: ["repository_metadata", "pull_request_context"], mock: true },
  { id: "int_jira", projectId: "prj_platform", providerId: "provider_jira", displayName: "Delivery planning", authorizationStatus: "pending", connectionStatus: "pending", health: { status: "unknown", checkedAt: null, message: "Authorization not confirmed" }, syncStatus: "never", lastSyncedAt: null, capabilities: ["issue_context"], mock: true },
  { id: "int_runtime", projectId: "prj_mcp", providerId: "provider_github", displayName: "MCP Runtime GitHub", authorizationStatus: "authorized", connectionStatus: "connected", health: { status: "degraded", checkedAt: "2026-09-28T18:10:00Z", message: "Mock latency warning" }, syncStatus: "failed", lastSyncedAt: "2026-09-28T18:02:00Z", capabilities: ["repository_metadata"], mock: true }
];
const runs = [
  { id: "irun_1", projectId: "prj_platform", connectionId: "int_github", type: "sync", status: "succeeded", startedAt: "2026-09-29T09:19:00Z", completedAt: "2026-09-29T09:20:00Z", importedRecords: 0, externalContacted: false, mock: true },
  { id: "irun_2", projectId: "prj_platform", connectionId: "int_jira", type: "health_check", status: "not_started", startedAt: null, completedAt: null, importedRecords: 0, externalContacted: false, mock: true },
  { id: "irun_3", projectId: "prj_mcp", connectionId: "int_runtime", type: "sync", status: "failed", startedAt: "2026-09-28T18:01:00Z", completedAt: "2026-09-28T18:02:00Z", importedRecords: 0, externalContacted: false, mock: true }
];
const activity = [
  { id: "activity_1", projectId: "prj_platform", actor: { id: "usr_satyam", name: "Satyam Singh", type: "user" }, action: "integration.reviewed", target: { type: "integration_connection", id: "int_github", label: "SYNASE GitHub" }, occurredAt: "2026-09-29T09:34:00Z", source: "user", domain: "integrations", outcome: "succeeded", mock: true },
  { id: "activity_2", projectId: "prj_platform", actor: { id: "system", name: "SYNASE mock adapter", type: "system" }, action: "integration.sync_receipt.created", target: { type: "integration_connection", id: "int_github", label: "SYNASE GitHub" }, occurredAt: "2026-09-29T09:20:00Z", source: "mock", domain: "integrations", outcome: "informational", mock: true },
  { id: "activity_3", projectId: "prj_platform", actor: { id: "usr_maya", name: "Maya Chen", type: "user" }, action: "report.reviewed", target: { type: "decision_report", id: "rpt_arch_01", label: "Architecture Review" }, occurredAt: "2026-09-29T09:12:00Z", source: "user", domain: "reports", outcome: "succeeded", mock: true },
  { id: "activity_4", projectId: "prj_mcp", actor: { id: "system", name: "SYNASE mock adapter", type: "system" }, action: "integration.health.warning", target: { type: "integration_connection", id: "int_runtime", label: "MCP Runtime GitHub" }, occurredAt: "2026-09-28T18:10:00Z", source: "system", domain: "integrations", outcome: "warning", mock: true }
];
const audit = Object.freeze([
  { id: "audit_evt_001", projectId: "prj_platform", actor: { id: "usr_satyam", type: "user", displayName: "Satyam Singh" }, action: "integration.connection.viewed", resource: { type: "integration_connection", id: "int_github", label: "SYNASE GitHub" }, occurredAt: "2026-09-29T09:34:00Z", outcome: "success", requestId: "req_mock_int_001", correlationId: "corr_phase11_001", metadata: { source: "mock_fixture", route: "/app/integrations", authorization: "[REDACTED]" }, immutable: true, mock: true },
  { id: "audit_evt_002", projectId: "prj_platform", actor: { id: "system", type: "system", displayName: "SYNASE mock adapter" }, action: "integration.sync.requested", resource: { type: "integration_connection", id: "int_github", label: "SYNASE GitHub" }, occurredAt: "2026-09-29T09:19:00Z", outcome: "accepted", requestId: "req_mock_sync_001", correlationId: "corr_phase11_002", metadata: { externalContacted: false, importedRecords: 0, requestBody: "[OMITTED]" }, immutable: true, mock: true },
  { id: "audit_evt_003", projectId: "prj_platform", actor: { id: "usr_maya", type: "user", displayName: "Maya Chen" }, action: "approval.comment.created", resource: { type: "approval", id: "apr_report_01", label: "Publish architecture review" }, occurredAt: "2026-09-29T09:20:00Z", outcome: "success", requestId: "req_mock_approval_001", correlationId: "corr_phase10_001", metadata: { source: "mock_fixture", safeFields: ["comment_id", "approval_id"] }, immutable: true, mock: true }
].map((event) => Object.freeze({ ...event, actor: Object.freeze(event.actor), resource: Object.freeze(event.resource), metadata: Object.freeze(redactSensitiveMetadata(event.metadata)) })));
function connection(projectId, id) {
  const item = connections.find((candidate) => candidate.projectId === projectId && candidate.id === id);
  if (!item) throw new Phase11ApiError("RESOURCE_NOT_FOUND", "Integration connection was not found.", 404); return item;
}
function receipt(projectId, operation, subjectId, idempotencyKey, extra = {}) {
  if (!idempotencyKey) throw new Phase11ApiError("IDEMPOTENCY_REQUIRED", "An idempotency key is required.", 400);
  const key = `${projectId}:${operation}:${subjectId}:${idempotencyKey}`; if (receipts.has(key)) return clone(receipts.get(key));
  const value = Object.freeze({ id: `receipt_${operation}_${subjectId}`, projectId, operation, subjectId, status: "mock_receipt", authorizationConfirmed: false, externalContacted: false, importedRecords: 0, executed: false, mock: true, ...extra });
  receipts.set(key, value); return clone(value);
}
export const phase11Api = {
  async listIntegrationProviders() { return page(providers); },
  async listIntegrationConnections(projectId) { return page(connections.filter((item) => item.projectId === projectId)); },
  async getIntegrationConnection(projectId, id) { return { data: clone(connection(projectId, id)) }; },
  async listIntegrationRuns(projectId, id) { return page(runs.filter((item) => item.projectId === projectId && (!id || item.connectionId === id))); },
  async connectIntegration(projectId, providerId, { idempotencyKey } = {}) { if (!providers.some((item) => item.id === providerId)) throw new Phase11ApiError("RESOURCE_NOT_FOUND", "Integration provider was not found.", 404); return { data: receipt(projectId, "connect", providerId, idempotencyKey, { connectionStatus: "pending", authorizationStatus: "pending" }) }; },
  async disconnectIntegration(projectId, id, { idempotencyKey } = {}) { connection(projectId, id); return { data: receipt(projectId, "disconnect", id, idempotencyKey, { connectionStatus: "unchanged" }) }; },
  async checkIntegrationHealth(projectId, id, { idempotencyKey } = {}) { connection(projectId, id); return { data: receipt(projectId, "health_check", id, idempotencyKey, { healthStatus: "mock_checked" }) }; },
  async syncIntegration(projectId, id, { idempotencyKey } = {}) { connection(projectId, id); return { data: receipt(projectId, "sync", id, idempotencyKey, { syncStatus: "mock_accepted" }) }; },
  async listActivity(projectId, filters = {}) { return page(activity.filter((item) => item.projectId === projectId).filter((item) => !filters.actor || item.actor.id === filters.actor).filter((item) => !filters.action || item.action.includes(filters.action)).filter((item) => !filters.domain || item.domain === filters.domain).filter((item) => !filters.from || item.occurredAt >= filters.from)); },
  async listAuditEvents(projectId, filters = {}) { return page(audit.filter((item) => item.projectId === projectId).filter((item) => !filters.actor || item.actor.id === filters.actor).filter((item) => !filters.action || item.action.includes(filters.action)).filter((item) => !filters.outcome || item.outcome === filters.outcome)); },
  async getAuditEvent(projectId, id) { const event = audit.find((item) => item.projectId === projectId && item.id === id); if (!event) throw new Phase11ApiError("RESOURCE_NOT_FOUND", "Audit event was not found.", 404); return { data: clone(event) }; }
};
export const createPhase11IdempotencyKey = () => globalThis.crypto?.randomUUID?.() ?? `idem_p11_${Date.now()}_${Math.random().toString(36).slice(2)}`;
