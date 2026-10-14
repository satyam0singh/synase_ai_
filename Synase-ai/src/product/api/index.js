// @ts-check
/* Product Intelligence API surface.

   A named subset of the shared adapter. Domain code imports this rather than
   the whole `api` object, so the boundary is explicit and testable. The
   underlying implementation is single-sourced in shared/api/mock.js. */

import { api } from "../../shared/api/index.js";

/**
 * Creates a product API client bound to an adapter.
 * @param {typeof api} [adapter]
 */
export function createProductApi(adapter = api) {
  return {
    getProductOverview: (projectId) => adapter.getProductOverview(projectId),

    listRequirements: (projectId) => adapter.listRequirements(projectId),
    getRequirement: (projectId, requirementId) => adapter.getRequirement(projectId, requirementId),
    createRequirement: (projectId, input, options) => adapter.createRequirement(projectId, input, options),
    updateRequirement: (projectId, requirementId, patch, options) => adapter.updateRequirement(projectId, requirementId, patch, options),
    deleteRequirement: (projectId, requirementId, options) => adapter.deleteRequirement(projectId, requirementId, options),
    importRequirements: (projectId, items, options) => adapter.importRequirements(projectId, items, options),

    listProductFeatures: (projectId) => adapter.listProductFeatures(projectId),
    getFeature: (projectId, featureId) => adapter.getFeature(projectId, featureId),
    createFeature: (projectId, input, options) => adapter.createFeature(projectId, input, options),
    updateFeature: (projectId, featureId, patch, options) => adapter.updateFeature(projectId, featureId, patch, options),
    deleteFeature: (projectId, featureId, options) => adapter.deleteFeature(projectId, featureId, options),
    reprioritizeFeatures: (projectId, ranks, options) => adapter.reprioritizeFeatures(projectId, ranks, options),

    getProductStrategy: (projectId) => adapter.getProductStrategy(projectId),
    saveProductStrategy: (projectId, input, options) => adapter.saveProductStrategy(projectId, input, options),

    listRoadmapItems: (projectId) => adapter.listRoadmapItems(projectId),
    createRoadmapItem: (projectId, input, options) => adapter.createRoadmapItem(projectId, input, options),
    updateRoadmapItem: (projectId, roadmapItemId, patch, options) => adapter.updateRoadmapItem(projectId, roadmapItemId, patch, options),
    deleteRoadmapItem: (projectId, roadmapItemId, options) => adapter.deleteRoadmapItem(projectId, roadmapItemId, options),
    resequenceRoadmap: (projectId, sequenceList, options) => adapter.resequenceRoadmap(projectId, sequenceList, options),

    listProductDecisions: (projectId) => adapter.listProductDecisions(projectId),
    getProductDecision: (projectId, decisionId) => adapter.getProductDecision(projectId, decisionId),

    runProductMock: (projectId, action, options) => adapter.runProductMock(projectId, action, options),
    runProductIntelligenceAction: (projectId, action, options) => adapter.runProductIntelligenceAction(projectId, action, options),
    analyzeProductRequirements: (projectId, options) => adapter.analyzeProductRequirements(projectId, options),
    getProductRequirementsSummary: (projectId) => adapter.getProductRequirementsSummary(projectId),
    analyzeProductStrategy: (projectId, options) => adapter.analyzeProductStrategy(projectId, options),
    generateProductRoadmap: (projectId, options) => adapter.generateProductRoadmap(projectId, options)
  };
}

export const productApi = createProductApi(api);