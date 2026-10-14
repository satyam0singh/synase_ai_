import test from "node:test";
import assert from "node:assert/strict";
import { productApi, createProductApi } from "../src/product/api/index.js";
import { ApiError, createIdempotencyKey } from "../src/shared/api/index.js";
import { state, resetProjectScope } from "../src/shared/state/store.js";
import {
  productIntelligencePage,
  overviewView,
  requirementsView,
  prioritizationView,
  strategyView,
  roadmapView,
  decisionsView
} from "../src/product/pages/index.js";

const TEST_PROJECT_ID = "prj_platform";

test("Product API lists requirements with canonical envelope", async () => {
  const res = await productApi.listRequirements(TEST_PROJECT_ID);
  assert.ok(Array.isArray(res.data));
  assert.ok(res.data.length > 0);
  assert.deepEqual(Object.keys(res.meta), ["page", "pageSize", "total"]);
  assert.ok(res.data.every((r) => r.projectId === TEST_PROJECT_ID));
});

test("Product mutations require an idempotency key (Invariant 08)", async () => {
  await assert.rejects(
    () => productApi.createRequirement(TEST_PROJECT_ID, { title: "No key", type: "functional", priority: "high" }),
    (err) => err instanceof ApiError && err.code === "IDEMPOTENCY_REQUIRED"
  );

  await assert.rejects(
    () => productApi.updateRequirement(TEST_PROJECT_ID, "REQ-001", { status: "approved" }),
    (err) => err instanceof ApiError && err.code === "IDEMPOTENCY_REQUIRED"
  );

  await assert.rejects(
    () => productApi.deleteRequirement(TEST_PROJECT_ID, "REQ-001"),
    (err) => err instanceof ApiError && err.code === "IDEMPOTENCY_REQUIRED"
  );

  await assert.rejects(
    () => productApi.createFeature(TEST_PROJECT_ID, { title: "Feature without key" }),
    (err) => err instanceof ApiError && err.code === "IDEMPOTENCY_REQUIRED"
  );

  await assert.rejects(
    () => productApi.reprioritizeFeatures(TEST_PROJECT_ID, ["FEAT-01"]),
    (err) => err instanceof ApiError && err.code === "IDEMPOTENCY_REQUIRED"
  );

  await assert.rejects(
    () => productApi.saveProductStrategy(TEST_PROJECT_ID, { objective: "Strategy without key" }),
    (err) => err instanceof ApiError && err.code === "IDEMPOTENCY_REQUIRED"
  );

  await assert.rejects(
    () => productApi.createRoadmapItem(TEST_PROJECT_ID, { milestone: "Milestone without key" }),
    (err) => err instanceof ApiError && err.code === "IDEMPOTENCY_REQUIRED"
  );

  await assert.rejects(
    () => productApi.runProductIntelligenceAction(TEST_PROJECT_ID, "overview"),
    (err) => err instanceof ApiError && err.code === "IDEMPOTENCY_REQUIRED"
  );
});

test("Requirement lifecycle: create, get, update, and idempotent replay", async () => {
  const ikey = createIdempotencyKey();
  const reqData = {
    title: "Test Requirement Lifecycle",
    type: "security",
    priority: "critical",
    rationale: "Contract verification for requirement lifecycle",
    evidence: ["SEC-AUDIT-01"],
    architectureImpact: "Auth Token Service"
  };

  const createRes = await productApi.createRequirement(TEST_PROJECT_ID, reqData, { idempotencyKey: ikey });
  assert.ok(createRes.data.id.startsWith("REQ-"));
  assert.equal(createRes.data.title, reqData.title);
  assert.equal(createRes.data.status, "identified");
  assert.equal(createRes.data.provenance, "confirmed");

  // Idempotent replay with same key returns identical object
  const replayRes = await productApi.createRequirement(TEST_PROJECT_ID, reqData, { idempotencyKey: ikey });
  assert.equal(replayRes.data.id, createRes.data.id);

  // Update status
  const updateRes = await productApi.updateRequirement(
    TEST_PROJECT_ID,
    createRes.data.id,
    { status: "approved" },
    { idempotencyKey: createIdempotencyKey() }
  );
  assert.equal(updateRes.data.status, "approved");

  // Fetch updated single requirement
  const getRes = await productApi.getRequirement(TEST_PROJECT_ID, createRes.data.id);
  assert.equal(getRes.data.status, "approved");
});

test("AI-proposed requirements have distinct provenance and confidence (Invariant 14)", async () => {
  const res = await productApi.listRequirements(TEST_PROJECT_ID);
  const aiItems = res.data.filter((r) => r.provenance === "ai_suggested");
  const confirmedItems = res.data.filter((r) => r.provenance === "confirmed");

  assert.ok(aiItems.length > 0, "Expected at least one AI suggested requirement fixture");
  assert.ok(confirmedItems.length > 0, "Expected at least one confirmed requirement fixture");

  for (const item of aiItems) {
    assert.equal(typeof item.confidence, "number");
    assert.ok(item.confidence >= 0 && item.confidence <= 1);
  }
});

test("Product Features: multi-criteria scoring and rank re-ordering", async () => {
  const initial = await productApi.listProductFeatures(TEST_PROJECT_ID);
  assert.ok(initial.data.length >= 2);

  // Reprioritize: swap first two
  const reorderedIds = initial.data.map((f) => f.id).reverse();
  const reprioritized = await productApi.reprioritizeFeatures(
    TEST_PROJECT_ID,
    reorderedIds,
    { idempotencyKey: createIdempotencyKey() }
  );

  assert.equal(reprioritized.data[0].id, reorderedIds[0]);
  assert.equal(reprioritized.data[0].priorityRank, 1);
  assert.equal(reprioritized.data[1].priorityRank, 2);
});

test("Product Strategy: get and update persistence", async () => {
  const initial = await productApi.getProductStrategy(TEST_PROJECT_ID);
  assert.ok(initial.data);
  assert.ok(initial.data.objective.length > 0);
  assert.ok(Array.isArray(initial.data.principles));
  assert.ok(Array.isArray(initial.data.risks));

  const updatedObjective = "Updated Mission Objective " + Date.now();
  const saved = await productApi.saveProductStrategy(
    TEST_PROJECT_ID,
    {
      objective: updatedObjective,
      principles: ["Tenet A", "Tenet B"],
      risks: ["Risk 1"]
    },
    { idempotencyKey: createIdempotencyKey() }
  );

  assert.equal(saved.data.objective, updatedObjective);
  assert.equal(saved.data.principles.length, 2);
});

test("Roadmap milestones: create, list, and delete", async () => {
  const milestone = "Milestone Integration " + Date.now();
  const created = await productApi.createRoadmapItem(
    TEST_PROJECT_ID,
    {
      milestone,
      release: "R9",
      status: "planned",
      dependencies: ["ROAD-01"]
    },
    { idempotencyKey: createIdempotencyKey() }
  );

  assert.ok(created.data.id.startsWith("ROAD-"));
  assert.equal(created.data.milestone, milestone);

  const list = await productApi.listRoadmapItems(TEST_PROJECT_ID);
  assert.ok(list.data.some((m) => m.id === created.data.id));

  const deleted = await productApi.deleteRoadmapItem(
    TEST_PROJECT_ID,
    created.data.id,
    { idempotencyKey: createIdempotencyKey() }
  );
  assert.equal(deleted.data.success, true);
});

test("Product decisions and overview projection", async () => {
  const decisions = await productApi.listProductDecisions(TEST_PROJECT_ID);
  assert.ok(Array.isArray(decisions.data));
  assert.ok(decisions.data.length > 0);
  assert.ok(decisions.data[0].title);
  assert.ok(decisions.data[0].decidedBy);

  const overview = await productApi.getProductOverview(TEST_PROJECT_ID);
  assert.ok(overview.data);
  assert.ok(typeof overview.data.metrics.totalRequirements === "number");
  assert.ok(typeof overview.data.metrics.prioritizedFeatures === "number");
});

test("Domain API factory produces independent instance (createProductApi)", async () => {
  const custom = createProductApi();
  const res = await custom.listRequirements(TEST_PROJECT_ID);
  assert.ok(Array.isArray(res.data));
});

test("Product page views render valid HTML without exceptions", async () => {
  // Populate state with test fixtures
  const [reqs, feats, strat, road, decs] = await Promise.all([
    productApi.listRequirements(TEST_PROJECT_ID),
    productApi.listProductFeatures(TEST_PROJECT_ID),
    productApi.getProductStrategy(TEST_PROJECT_ID),
    productApi.listRoadmapItems(TEST_PROJECT_ID),
    productApi.listProductDecisions(TEST_PROJECT_ID)
  ]);

  state.projectId = TEST_PROJECT_ID;
  state.requirements = reqs.data;
  state.productFeatures = feats.data;
  state.productStrategy = strat.data;
  state.roadmapItems = road.data;
  state.productDecisions = decs.data;

  // Render Overview
  state.productSection = "overview";
  const htmlOverview = productIntelligencePage();
  assert.match(htmlOverview, /Product Intelligence/);
  assert.match(htmlOverview, /Requirements Verified/);

  // Render Requirements
  state.productSection = "requirements";
  const htmlReqs = productIntelligencePage();
  assert.match(htmlReqs, /Evidence & Arch Impact/);
  assert.match(htmlReqs, /id="product-search-input"/);

  // Render Prioritization
  state.productSection = "prioritization";
  const htmlPrio = productIntelligencePage();
  assert.match(htmlPrio, /Candidate Feature Prioritization/);
  assert.match(htmlPrio, /Business Value/);

  // Render Strategy
  state.productSection = "strategy";
  const htmlStrat = productIntelligencePage();
  assert.match(htmlStrat, /Strategic Intent/);
  assert.match(htmlStrat, /Guiding Principles/);

  // Render Roadmap
  state.productSection = "roadmap";
  const htmlRoad = productIntelligencePage();
  assert.match(htmlRoad, /Milestone Delivery Roadmap/);

  // Render Decisions
  state.productSection = "decisions";
  const htmlDecs = productIntelligencePage();
  assert.match(htmlDecs, /Audited Product Decisions/);

  // Clean reset
  resetProjectScope();
});

test("Feature deletion and requirement import lifecycle", async () => {
  // Test importRequirements
  const imported = await productApi.importRequirements(
    TEST_PROJECT_ID,
    [
      { title: "Imported requirement A", type: "security", priority: "critical" },
      { title: "Imported requirement B", type: "functional", priority: "medium" }
    ],
    { idempotencyKey: createIdempotencyKey() }
  );
  assert.equal(imported.data.length, 2);
  assert.equal(imported.meta.importedCount, 2);

  // Test create & delete feature
  const newFeat = await productApi.createFeature(
    TEST_PROJECT_ID,
    { title: "Temporary feature for deletion test", businessValue: 6, effort: 4 },
    { idempotencyKey: createIdempotencyKey() }
  );
  assert.ok(newFeat.data.id.startsWith("FEAT-"));

  const delRes = await productApi.deleteFeature(TEST_PROJECT_ID, newFeat.data.id, {
    idempotencyKey: createIdempotencyKey()
  });
  assert.equal(delRes.data.deleted, true);

  await assert.rejects(
    () => productApi.getFeature(TEST_PROJECT_ID, newFeat.data.id),
    (err) => err instanceof ApiError && err.code === "RESOURCE_NOT_FOUND"
  );
});

test("Roadmap resequencing and intelligence analysis actions", async () => {
  const road = await productApi.listRoadmapItems(TEST_PROJECT_ID);
  assert.ok(road.data.length >= 2);

  // Resequence roadmap
  const resequenced = await productApi.resequenceRoadmap(
    TEST_PROJECT_ID,
    [road.data[1].id, road.data[0].id],
    { idempotencyKey: createIdempotencyKey() }
  );
  assert.ok(Array.isArray(resequenced.data));

  // Intelligence action calls
  const reqAnalysis = await productApi.analyzeProductRequirements(TEST_PROJECT_ID, {
    idempotencyKey: createIdempotencyKey()
  });
  assert.equal(reqAnalysis.data.status, "mock_completed");

  const summary = await productApi.getProductRequirementsSummary(TEST_PROJECT_ID);
  assert.ok(summary.data.total >= 2);
  assert.ok(summary.data.byPriority);

  const stratAnalysis = await productApi.analyzeProductStrategy(TEST_PROJECT_ID, {
    idempotencyKey: createIdempotencyKey()
  });
  assert.equal(stratAnalysis.data.status, "mock_completed");

  const roadGen = await productApi.generateProductRoadmap(TEST_PROJECT_ID, {
    idempotencyKey: createIdempotencyKey()
  });
  assert.equal(roadGen.data.status, "mock_completed");
});

