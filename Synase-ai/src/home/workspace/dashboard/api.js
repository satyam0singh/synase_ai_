// @ts-check
export class Phase12ApiError extends Error {
  constructor(code, message, status = 500, requestId = "") {
    super(message);
    this.name = "Phase12ApiError";
    this.code = code;
    this.status = status;
    this.requestId = requestId || `req_p12_${Math.random().toString(36).slice(2, 10)}`;
  }
}

const clone = globalThis.structuredClone || ((value) => JSON.parse(JSON.stringify(value)));
const secretKey = /authorization|cookie|credential|password|secret|token|api[_-]?key|private[_-]?key|client[_-]?secret/i;
const rawKey = /headers|request(body|payload)|response(body|payload)|raw(body|payload)/i;

export function sanitizeIntegrationMetadata(value, seen = new WeakSet()) {
  if (Array.isArray(value)) return value.map((item) => sanitizeIntegrationMetadata(item, seen));
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return "[CIRCULAR]";
  seen.add(value);
  return Object.fromEntries(Object.entries(value).map(([key, nested]) => [
    key,
    secretKey.test(key) ? "[REDACTED]" : rawKey.test(key) ? "[OMITTED]" : sanitizeIntegrationMetadata(nested, seen)
  ]));
}

const dashboard = Object.freeze({
  id: "dashboard_ws_synase",
  workspaceId: "ws_synase",
  selectedProjectId: "prj_platform",
  scope: "selected_project_mock",
  aggregateContractStatus: "unresolved",
  source: "deterministic_mock",
  generatedAt: "2026-09-29T12:30:00Z",
  metrics: [
    { id: "attention", label: "Needs attention", value: 5, tone: "warning", detail: "Review—not execution" },
    { id: "active_projects", label: "Active projects", value: 2, tone: "neutral", detail: "Selected workspace fixture" },
    { id: "workflow_health", label: "Workflow health", value: "1 waiting", tone: "warning", detail: "Authoritative mock states" },
    { id: "approvals", label: "Pending approvals", value: 2, tone: "warning", detail: "Approved does not mean executed" }
  ],
  attention: [
    { id: "att_approval", kind: "approval", severity: "high", title: "Publication approval pending", detail: "Architecture report requires human review.", href: "/app/approvals", proposed: false, executed: false },
    { id: "att_workflow", kind: "workflow", severity: "medium", title: "Workflow waiting for input", detail: "Run wf_platform_02 is waiting; no progress is synthesized.", href: "/app/projects/prj_platform/runs", proposed: false, executed: false },
    { id: "att_finding", kind: "finding", severity: "critical", title: "Critical security finding", detail: "AI-proposed finding requires evidence review.", href: "/app/intelligence/devops", proposed: true, executed: false },
    { id: "att_context", kind: "context", severity: "medium", title: "Context source is stale", detail: "Refresh behavior is unavailable until a transport contract exists.", href: "/app/context/overview", proposed: false, executed: false },
    { id: "att_integration", kind: "integration", severity: "low", title: "Authorization incomplete", detail: "Jira authorization remains pending and is not inferred.", href: "/app/integrations", proposed: false, executed: false }
  ],
  projects: [
    { id: "prj_platform", name: "SYNASE AI Platform", lifecycle: "active", health: "attention", summary: "Core product and DevOps decision intelligence." },
    { id: "prj_mcp", name: "MCP Runtime", lifecycle: "active", health: "degraded", summary: "Model, tool, agent, and server orchestration." },
    { id: "prj_research", name: "Research Sandbox", lifecycle: "paused", health: "unknown", summary: "Paused mock project; no live execution." }
  ],
  workflows: [
    { id: "wf_platform_01", label: "Architecture review", status: "completed", progressPercent: 100 },
    { id: "wf_platform_02", label: "Security assessment", status: "waiting", progressPercent: 42 },
    { id: "wf_platform_03", label: "Dependency analysis", status: "failed", progressPercent: 64 }
  ],
  outputs: { reports: { draft: 1, reviewRequired: 1, approved: 1, published: 0 }, approvals: { pending: 2, approved: 1, executed: 0 } },
  readiness: [
    { id: "adapter", label: "Adapter mode", status: "mock", detail: "Deterministic adapter selected at composition root." },
    { id: "base_url", label: "Base URL", status: "not_configured", detail: "Live API URL is not configured." },
    { id: "auth", label: "Authentication contract", status: "blocked", detail: "Login/session contract remains unresolved." },
    { id: "aggregate", label: "Workspace aggregate", status: "blocked", detail: "Dashboard aggregate contract remains unresolved." },
    { id: "sse", label: "Workflow SSE", status: "contract_partial", detail: "Only workflow SSE is defined; auth/replay remain unresolved." },
    { id: "upload", label: "Signed upload", status: "blocked", detail: "Initiation/completion fields remain unresolved." }
  ],
  activity: [
    { id: "act_1", actor: "Satyam Singh", action: "reviewed architecture report", occurredAt: "2026-09-29T12:20:00Z", source: "user", audit: false },
    { id: "act_2", actor: "SYNASE mock adapter", action: "created a non-executing sync receipt", occurredAt: "2026-09-29T12:10:00Z", source: "mock", audit: false },
    { id: "act_3", actor: "Maya Chen", action: "commented on an approval", occurredAt: "2026-09-29T12:00:00Z", source: "user", audit: false }
  ],
  execution: { externalContacted: false, importedRecords: 0, secretsExposed: false, downstreamActionsExecuted: false }
});

function validateBaseUrl(baseUrl) {
  if (!baseUrl) throw new Phase12ApiError("LIVE_API_NOT_CONFIGURED", "Live API base URL is not configured.", 503);
  let parsed;
  try { parsed = new URL(baseUrl); } catch { throw new Phase12ApiError("INVALID_API_BASE_URL", "Live API base URL is invalid.", 400); }
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) {
    throw new Phase12ApiError("UNSAFE_API_BASE_URL", "Live API base URL must use HTTPS, except for local development.", 400);
  }
  return parsed.toString().replace(/\/$/, "");
}

function decodeDashboard(value, requestId = "") {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Phase12ApiError("MALFORMED_RESPONSE", "Dashboard response must be an object.", 502, requestId);
  const required = ["workspaceId", "metrics", "attention", "projects", "workflows", "readiness", "activity"];
  if (required.some((key) => !(key in value)) || !required.slice(1).every((key) => Array.isArray(value[key]))) {
    throw new Phase12ApiError("MALFORMED_RESPONSE", "Dashboard response does not match the Phase 12 contract.", 502, requestId);
  }
  return sanitizeIntegrationMetadata(value);
}

export function createPhase12Service({ mode = "mock", baseUrl = "", fetchImpl = globalThis.fetch, timeoutMs = 8000 } = {}) {
  if (!new Set(["mock", "live"]).has(mode)) throw new Phase12ApiError("INVALID_ADAPTER_MODE", "Adapter mode must be mock or live.", 400);
  return Object.freeze({
    mode,
    async getDashboard({ signal } = {}) {
      if (mode === "mock") return { data: clone(dashboard), meta: { adapterMode: "mock", externalContacted: false } };
      const root = validateBaseUrl(baseUrl);
      if (typeof fetchImpl !== "function") throw new Phase12ApiError("FETCH_UNAVAILABLE", "Live adapter transport is unavailable.", 503);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(new DOMException("Timed out", "TimeoutError")), timeoutMs);
      const onAbort = () => controller.abort(signal?.reason);
      signal?.addEventListener("abort", onAbort, { once: true });
      const requestId = globalThis.crypto?.randomUUID?.() || `req_p12_${Date.now()}`;
      try {
        const response = await fetchImpl(`${root}/api/v1/dashboard`, { method: "GET", headers: { Accept: "application/json", "X-Request-ID": requestId }, signal: controller.signal, credentials: "include" });
        const returnedRequestId = response.headers?.get?.("x-request-id") || requestId;
        if (!response.ok) throw new Phase12ApiError(`HTTP_${response.status}`, "Dashboard request failed.", response.status, returnedRequestId);
        const body = await response.json();
        return { data: decodeDashboard(body?.data ?? body, returnedRequestId), meta: { adapterMode: "live", requestId: returnedRequestId } };
      } catch (error) {
        if (error instanceof Phase12ApiError) throw error;
        if (controller.signal.aborted) throw new Phase12ApiError("REQUEST_ABORTED", "Dashboard request was cancelled or timed out.", 408, requestId);
        throw new Phase12ApiError("NETWORK_UNAVAILABLE", "Live dashboard could not be reached.", 503, requestId);
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
      }
    },
    async getIntegrationReadiness() {
      if (mode === "mock") return { data: clone(dashboard.readiness), meta: { adapterMode: "mock", externalContacted: false } };
      validateBaseUrl(baseUrl);
      return { data: [
        { id: "adapter", label: "Adapter mode", status: "live_configured", detail: "Live adapter selected; connectivity is not implied." },
        { id: "contract", label: "Contract probe", status: "not_run", detail: "Only the dashboard read performs a safe GET request." }
      ], meta: { adapterMode: "live", externalContacted: false } };
    }
  });
}

export const phase12Api = createPhase12Service({ mode: "mock" });
export const phase12DashboardFixture = dashboard;
