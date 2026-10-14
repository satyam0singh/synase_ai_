export type IntegrationAuthorizationStatus = "not_started" | "pending" | "authorized" | "denied" | "expired" | "revoked" | "failed";
export type IntegrationConnectionStatus = "pending" | "connected" | "disconnected" | "error" | "revoked";
export type IntegrationHealthStatus = "unknown" | "healthy" | "degraded" | "unavailable";
export type IntegrationRunStatus = "not_started" | "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type AuditOutcome = "success" | "accepted" | "failure" | "denied" | "warning";
export type SafeAuditMetadata = Readonly<Record<string, unknown>>;
export interface IntegrationCapability { key: string; label: string; description?: string }
export interface IntegrationProvider { id: string; name: string; category: string; availabilityStatus: "available" | "planned" | "disabled"; capabilities: string[]; authorizationMethod: "oauth" | "app" | "manual" | "none"; mock?: boolean }
export interface IntegrationHealth { status: IntegrationHealthStatus; checkedAt: string | null; message?: string }
export interface IntegrationConnection { id: string; projectId: string; providerId: string; displayName: string; authorizationStatus: IntegrationAuthorizationStatus; connectionStatus: IntegrationConnectionStatus; health: IntegrationHealth; syncStatus: "never" | "queued" | "running" | "succeeded" | "failed"; lastSyncedAt: string | null; capabilities: string[]; mock?: boolean }
export interface IntegrationRun { id: string; projectId: string; connectionId: string; type: "sync" | "health_check"; status: IntegrationRunStatus; startedAt: string | null; completedAt: string | null; importedRecords: 0; externalContacted: false; mock: true }
export interface IntegrationSyncReceipt { id: string; projectId: string; operation: "connect" | "disconnect" | "health_check" | "sync"; subjectId: string; status: "mock_receipt"; authorizationConfirmed: false; externalContacted: false; importedRecords: 0; executed: false; mock: true }
export interface ActivityActor { id: string; name: string; type: "user" | "system" }
export interface ActivityItem { id: string; projectId: string; actor: ActivityActor; action: string; target: { type: string; id: string; label: string }; occurredAt: string; source: "user" | "system" | "mock"; domain: string; outcome: "succeeded" | "failed" | "warning" | "informational"; mock: true }
export interface AuditActor { id: string; type: "user" | "system" | "service"; displayName: string }
export interface AuditResourceRef { type: string; id: string; label: string }
export interface AuditEvent { readonly id: string; readonly projectId: string; readonly actor: AuditActor; readonly action: string; readonly resource: AuditResourceRef; readonly occurredAt: string; readonly outcome: AuditOutcome; readonly requestId: string; readonly correlationId: string; readonly metadata: SafeAuditMetadata; readonly immutable: true; readonly mock: true }
