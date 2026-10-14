// @ts-check
/* Public surface of the shared API layer.

   `api` remains the deterministic mock adapter so existing call sites and
   tests keep working unchanged. Domain modules import their own narrow facade
   (product/api, devops/api, mcp/api, ...) which is built from this object, so
   there is still exactly one implementation. */

import { mockApi } from "./mock.js";

export { ApiError } from "./errors.js";
export { createIdempotencyKey } from "./idempotency.js";
export { redactMcpPayload, normalizeWorkflowEvents } from "./redaction.js";
export { mockApi } from "./mock.js";
export { liveApi } from "./live.js";
export { db } from "./db.js";

/* Historical alias kept for compatibility. */
export const api = mockApi;
