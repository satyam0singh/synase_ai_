// @ts-check
/* Decision outputs API surface: reports and human approvals. */

import { api } from "../../shared/api/index.js";

export const outputsApi = {
  listReports: (projectId) => api.listReports(projectId),
  getReport: (projectId, reportId) => api.getReport(projectId, reportId),
  generateReport: (projectId, type, options) =>
    api.generateReport(projectId, type, options),
  publishReport: (projectId, reportId, options) =>
    api.publishReport(projectId, reportId, options),
  exportReport: (projectId, reportId, format, options) =>
    api.exportReport(projectId, reportId, format, options),
  listApprovals: (projectId) => api.listApprovals(projectId),
  getApproval: (projectId, approvalId) => api.getApproval(projectId, approvalId),
  decideApproval: (projectId, approvalId, decision, rationale, options) =>
    api.decideApproval(projectId, approvalId, decision, rationale, options),
  addApprovalComment: (projectId, approvalId, text, options) =>
    api.addApprovalComment(projectId, approvalId, text, options),
  cancelApproval: (projectId, approvalId, options) =>
    api.cancelApproval(projectId, approvalId, options)
};