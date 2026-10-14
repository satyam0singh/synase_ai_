// @ts-check
/* Shared context API surface: context explorer, memory, retrieval history and
   the knowledge graph. See product/api/index.js for the facade rationale. */

import { api } from "../../shared/api/index.js";

export const contextApi = {
  listContextItems: (projectId) => api.listContextItems(projectId),
  searchMemory: (projectId, query) => api.searchMemory(projectId, query),
  listRetrievalHistory: (projectId) => api.listRetrievalHistory(projectId),
  getKnowledgeGraph: (projectId) => api.getKnowledgeGraph(projectId),
  runContextMock: (projectId, action, options) =>
    api.runContextMock(projectId, action, options)
};