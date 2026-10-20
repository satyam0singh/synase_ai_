// @ts-check
/* Public surface of the shared API layer.

   `api` remains the deterministic mock adapter so existing call sites and
   tests keep working unchanged. Domain modules import their own narrow facade
   (product/api, devops/api, mcp/api, ...) which is built from this object, so
   there is still exactly one implementation. */

import { mockApi } from "./mock.js";
import { liveApi, getAccessToken } from "./live.js";

export { ApiError } from "./errors.js";
export { createIdempotencyKey } from "./idempotency.js";
export { redactMcpPayload, normalizeWorkflowEvents } from "./redaction.js";
export { mockApi } from "./mock.js";
export { liveApi } from "./live.js";
export { db } from "./db.js";

/* Keep product data on its deterministic fixtures while auth uses the live
   orchestrator. This lets the deployed frontend authenticate without
   pretending the backend already implements the other product domains. */
export const api = {
  ...mockApi,
  login: liveApi.login,
  register: liveApi.register,
  recover: liveApi.recover,
  getMe: () => getAccessToken() ? liveApi.getMe() : mockApi.getMe(),
  logout: liveApi.logout
};
