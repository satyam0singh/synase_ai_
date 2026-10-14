// @ts-check
/* DevOps Intelligence API surface. See product/api/index.js for the rationale. */

import { api } from "../../shared/api/index.js";

export const devopsApi = {
  getDevOpsSummary: (projectId) => api.getDevOpsSummary(projectId),
  listFindings: (projectId) => api.listFindings(projectId),
  listDevOpsRecommendations: (projectId) => api.listDevOpsRecommendations(projectId),
  listDependencies: (projectId) => api.listDependencies(projectId),
  listTestSuggestions: (projectId) => api.listTestSuggestions(projectId),
  listDeploymentPlans: (projectId) => api.listDeploymentPlans(projectId),
  runDevOpsMock: (projectId, domain, options) =>
    api.runDevOpsMock(projectId, domain, options)
};