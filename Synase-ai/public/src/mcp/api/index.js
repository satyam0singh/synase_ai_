// @ts-check
/* MCP V2 API surface. MCP is deliberately isolated: nothing here imports from
   product/ or devops/. See product/api/index.js for the facade rationale. */

import { api, redactMcpPayload } from "../../shared/api/index.js";

export { redactMcpPayload };

export const mcpApi = {
  getOverview: () => api.getMcpOverview(),
  listRequests: () => api.listMcpRequests(),
  getTrace: (requestId) => api.getMcpTrace(requestId),
  listModels: () => api.listMcpModels(),
  listTools: () => api.listMcpTools(),
  listServers: () => api.listMcpServers(),
  listDirectories: () => api.listMcpDirectories(),
  checkServerHealth: (serverId) => api.checkMcpServerHealth(serverId),
  discoverDirectory: (directoryId, options) =>
    api.discoverMcpDirectory(directoryId, options)
};