// @ts-check
/* Chat & Work API surface.

   A named subset of the shared adapter, like every other domain facade. This
   module imports only from shared/, never from product/ or devops/: the work
   surface reaches the shared adapter directly rather than sideways into a
   sibling domain. See ARCHITECTURE.md section 9. */

import { api } from "../../shared/api/index.js";

export const workApi = {
  listWorkSessions: (projectId) => api.listWorkSessions(projectId),
  getWorkSession: (projectId, sessionId) => api.getWorkSession(projectId, sessionId),
  createWorkSession: (projectId, input, options) =>
    api.createWorkSession(projectId, input, options),
  updateWorkSession: (projectId, sessionId, patch, options) =>
    api.updateWorkSession(projectId, sessionId, patch, options),
  listWorkMessages: (projectId, sessionId) => api.listWorkMessages(projectId, sessionId),
  listWorkArtifacts: (projectId, sessionId) => api.listWorkArtifacts(projectId, sessionId),
  getWorkArtifact: (projectId, artifactId) => api.getWorkArtifact(projectId, artifactId),
  postWorkMessage: (projectId, sessionId, input, options) =>
    api.postWorkMessage(projectId, sessionId, input, options),
  runWorkAssistant: (projectId, sessionId, input, options) =>
    api.runWorkAssistant(projectId, sessionId, input, options),
  connectWorkRepository: (projectId, input, options) =>
    api.connectWorkRepository(projectId, input, options)
};

/* Connections already present for a project, so the surface can tell the
   user whether the GitHub banner is still needed. Kept on this facade because
   it is only ever read by the work surface. */
export const workRepositoryState = {
  hasGithub: (projectId, repositories) =>
    repositories.some(
      (repo) => repo.projectId === projectId && repo.providerName === "github"
    )
};