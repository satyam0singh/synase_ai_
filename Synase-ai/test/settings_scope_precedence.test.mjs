import test from "node:test";
import assert from "node:assert/strict";
import { settingsApi } from "../src/settings/api/index.js";
import { settingsRegistry, resolveEffectiveSetting, SCOPE_PRECEDENCE } from "../src/shared/api/settingsEngine.js";
import { createIdempotencyKey } from "../src/shared/api/index.js";

test("Scope precedence ladder matches canonical ordering", () => {
  assert.deepEqual(SCOPE_PRECEDENCE, [
    'system',
    'workspace',
    'project',
    'agent',
    'task',
    'session',
    'user'
  ]);
});

test("Hierarchy Resolver: project scope overrides workspace and system defaults", () => {
  const def = settingsRegistry.find((d) => d.id === "ai.temperature");
  assert.ok(def);

  // 1. System default
  const resSystem = resolveEffectiveSetting(def, []);
  assert.equal(resSystem.value, 0.2);
  assert.equal(resSystem.sourceScope, "system");
  assert.equal(resSystem.isOverridden, false);

  // 2. Workspace override
  const resWs = resolveEffectiveSetting(def, [
    { definitionId: "ai.temperature", scope: "workspace", scopeId: "ws_synase", value: 0.15, version: 1, updatedAt: "", updatedBy: "" }
  ], { workspaceId: "ws_synase" });
  assert.equal(resWs.value, 0.15);
  assert.equal(resWs.sourceScope, "workspace");
  assert.equal(resWs.isOverridden, true);

  // 3. Project override supersedes workspace
  const resProj = resolveEffectiveSetting(def, [
    { definitionId: "ai.temperature", scope: "workspace", scopeId: "ws_synase", value: 0.15, version: 1, updatedAt: "", updatedBy: "" },
    { definitionId: "ai.temperature", scope: "project", scopeId: "prj_platform", value: 0.05, version: 2, updatedAt: "", updatedBy: "" }
  ], { workspaceId: "ws_synase", projectId: "prj_platform" });
  assert.equal(resProj.value, 0.05);
  assert.equal(resProj.sourceScope, "project");
  assert.equal(resProj.isOverridden, true);
});

test("Scope Isolation: changes at workspace scope do not mutate other scopes", async () => {
  const ikey = createIdempotencyKey();
  const updateRes = await settingsApi.updateSetting({
    id: "ai.fallback_provider",
    scope: "workspace",
    scopeId: "ws_synase",
    value: false,
    idempotencyKey: ikey
  });

  assert.equal(updateRes.data.sourceScope, "workspace");
  assert.equal(updateRes.data.value, false);

  // Check effective setting under project scope without project override still falls back to workspace
  const eff = await settingsApi.getEffectiveSettings({ workspaceId: "ws_synase", projectId: "prj_platform" });
  const aiFallback = eff.data.find((s) => s.id === "ai.fallback_provider");
  assert.ok(aiFallback);
  assert.equal(aiFallback.value, false);
  assert.equal(aiFallback.sourceScope, "workspace");
});

test("Section Reset: resetting a section resets only that section's settings", async () => {
  const ikey1 = createIdempotencyKey();
  const ikey2 = createIdempotencyKey();

  // Modify one AI setting and one Security setting
  await settingsApi.updateSetting({
    id: "ai.fallback_provider",
    scope: "workspace",
    scopeId: "ws_synase",
    value: false,
    idempotencyKey: ikey1
  });

  await settingsApi.updateSetting({
    id: "security.mfa_enforced",
    scope: "workspace",
    scopeId: "ws_synase",
    value: false,
    idempotencyKey: ikey2
  });

  // Reset only the ai-models section
  const resetRes = await settingsApi.resetSettings({
    workspaceId: "ws_synase",
    section: "ai-models"
  });

  assert.ok(Array.isArray(resetRes.data));
  assert.ok(resetRes.meta.resetCount >= 1);

  // Verify ai-models returned to default while security remained customized
  const effAfter = await settingsApi.getEffectiveSettings({ workspaceId: "ws_synase" });
  const aiFallback = effAfter.data.find((s) => s.id === "ai.fallback_provider");
  const secMfa = effAfter.data.find((s) => s.id === "security.mfa_enforced");

  assert.equal(aiFallback?.value, true); // restored default
  assert.equal(secMfa?.value, false);   // untouched
});

test("Export Domain Spec: JSON export is sanitized and excludes plain secrets", async () => {
  const exportRes = await settingsApi.exportWorkspaceData("ws_synase", { anonymize: true });
  assert.ok(exportRes.data);
  assert.equal(exportRes.data.schemaVersion, 1);
  assert.ok(Array.isArray(exportRes.data.settings));

  const jsonString = JSON.stringify(exportRes.data);

  // Verify sensitive terms are not exposed in cleartext
  assert.equal(jsonString.includes("oneTimeSecret"), false);
  assert.equal(jsonString.includes("plainSecret"), false);
  assert.equal(jsonString.includes("rawCredential"), false);
});
