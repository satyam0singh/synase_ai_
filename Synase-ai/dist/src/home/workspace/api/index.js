// @ts-check
/* Workspace API surface: session, workspaces, members, projects, repository
   context, multimodal inputs, conversations, analysis requests and workflow
   execution. See product/api/index.js for the facade rationale. */

import { api } from "../../../shared/api/index.js";

export const workspaceApi = {
  /* session */
  login: (credentials) => api.login(credentials),
  register: (input) => api.register(input),
  recover: (email) => api.recover(email),
  getMe: () => api.getMe(),

  /* workspaces + members */
  listWorkspaces: () => api.listWorkspaces(),
  getWorkspace: (id) => api.getWorkspace(id),
  listWorkspaceMembers: () => api.listWorkspaceMembers(),
  inviteWorkspaceMember: (input) => api.inviteWorkspaceMember(input),

  /* projects */
  listProjects: (workspaceId) => api.listProjects(workspaceId),
  getProject: (id) => api.getProject(id),
  createProject: (input, options) => api.createProject(input, options),
  updateProject: (id, patch) => api.updateProject(id, patch),

  /* repository context */
  listRepositories: (projectId) => api.listRepositories(projectId),
  connectRepository: (projectId, input, options) =>
    api.connectRepository(projectId, input, options),
  syncRepository: (projectId, repositoryId) =>
    api.syncRepository(projectId, repositoryId),
  listRepositorySnapshots: (repositoryId) =>
    api.listRepositorySnapshots(repositoryId),
  getRepositoryTree: (repositoryId) => api.getRepositoryTree(repositoryId),

  /* multimodal inputs */
  listAssets: (projectId) => api.listAssets(projectId),
  initiateUpload: (projectId, input, options) =>
    api.initiateUpload(projectId, input, options),
  completeUpload: (projectId, assetId) => api.completeUpload(projectId, assetId),
  addTextInput: (projectId, input) => api.addTextInput(projectId, input),
  addUrlInput: (projectId, input) => api.addUrlInput(projectId, input),
  advanceAssetDemo: (projectId, assetId) =>
    api.advanceAssetDemo(projectId, assetId),
  deleteAsset: (projectId, assetId) => api.deleteAsset(projectId, assetId),

  /* conversations + analysis requests */
  listConversations: (projectId) => api.listConversations(projectId),
  createConversation: (projectId, input, options) =>
    api.createConversation(projectId, input, options),
  listMessages: (projectId, conversationId) =>
    api.listMessages(projectId, conversationId),
  postMessage: (projectId, conversationId, input, options) =>
    api.postMessage(projectId, conversationId, input, options),
  listAnalysisRequests: (projectId) => api.listAnalysisRequests(projectId),
  createAnalysisRequest: (projectId, input, options) =>
    api.createAnalysisRequest(projectId, input, options),
  cancelAnalysisRequest: (projectId, requestId) =>
    api.cancelAnalysisRequest(projectId, requestId),

  /* workflow execution */
  listWorkflows: (projectId) => api.listWorkflows(projectId),
  getWorkflow: (projectId, workflowId) => api.getWorkflow(projectId, workflowId),
  listWorkflowTasks: (projectId, workflowId) =>
    api.listWorkflowTasks(projectId, workflowId),
  listWorkflowEvents: (projectId, workflowId) =>
    api.listWorkflowEvents(projectId, workflowId),
  controlWorkflow: (projectId, workflowId, action) =>
    api.controlWorkflow(projectId, workflowId, action),
  nextMockWorkflowEvent: (projectId, workflowId) =>
    api.nextMockWorkflowEvent(projectId, workflowId)
};