import test from "node:test";
import assert from "node:assert/strict";
import { settingsApi, createSettingsApi } from "../src/settings/api/index.js";
import { settingsRegistry, resolveEffectiveSetting } from "../src/shared/api/settingsEngine.js";
import { ApiError, createIdempotencyKey } from "../src/shared/api/index.js";
import { state } from "../src/shared/state/store.js";

test("Settings API returns effective settings with canonical envelope", async () => {
  const res = await settingsApi.getEffectiveSettings("general");
  assert.ok(Array.isArray(res.data));
  assert.ok(res.data.length > 0);
  assert.equal(res.meta.section, "general");
  assert.ok(res.data.every((s) => s.id && s.definition));
});

test("Settings scope resolver enforces scope precedence", () => {
  const def = settingsRegistry.find((d) => d.id === "ai.temperature");
  assert.ok(def);

  // Default when no overrides
  const effDefault = resolveEffectiveSetting(def, []);
  assert.equal(effDefault.value, 0.2);
  assert.equal(effDefault.sourceScope, "system");
  assert.equal(effDefault.isOverridden, false);

  // Workspace override
  const effWs = resolveEffectiveSetting(def, [
    { definitionId: "ai.temperature", scope: "workspace", scopeId: "ws_synase", value: 0.1, version: 1, updatedAt: "", updatedBy: "" }
  ], { workspaceId: "ws_synase" });
  assert.equal(effWs.value, 0.1);
  assert.equal(effWs.sourceScope, "workspace");
  assert.equal(effWs.isOverridden, true);

  // Project override supersedes workspace override
  const effPrj = resolveEffectiveSetting(def, [
    { definitionId: "ai.temperature", scope: "workspace", scopeId: "ws_synase", value: 0.1, version: 1, updatedAt: "", updatedBy: "" },
    { definitionId: "ai.temperature", scope: "project", scopeId: "prj_platform", value: 0.05, version: 2, updatedAt: "", updatedBy: "" }
  ], { workspaceId: "ws_synase", projectId: "prj_platform" });
  assert.equal(effPrj.value, 0.05);
  assert.equal(effPrj.sourceScope, "project");
  assert.equal(effPrj.isOverridden, true);
});

test("Settings mutations require idempotency key (Invariant 08)", async () => {
  await assert.rejects(
    () => settingsApi.updateSetting("general.profile_name", { value: "New Name" }),
    (err) => err instanceof ApiError && err.code === "IDEMPOTENCY_REQUIRED"
  );

  await assert.rejects(
    () => settingsApi.createApiKey({ name: "Unsafe Key" }),
    (err) => err instanceof ApiError && err.code === "IDEMPOTENCY_REQUIRED"
  );

  await assert.rejects(
    () => settingsApi.revokeApiKey("key_prod_01"),
    (err) => err instanceof ApiError && err.code === "IDEMPOTENCY_REQUIRED"
  );
});

test("API key creation returns one-time secret and masks stored record (Invariant 19)", async () => {
  const ikey = createIdempotencyKey();
  const created = await settingsApi.createApiKey(
    { name: "Automation Worker", scopes: ["workflows:run"] },
    { idempotencyKey: ikey }
  );

  assert.ok(created.data.key.id.startsWith("key_"));
  assert.ok(created.data.key.prefix.startsWith("syn_live_"));
  assert.ok(created.data.oneTimeSecret.includes("_sec_"));
  assert.equal(created.data.secretShownOnce, true);

  // Fetch list: ensure plain secret is not in the list
  const list = await settingsApi.listApiKeys();
  const found = list.data.find((k) => k.id === created.data.key.id);
  assert.ok(found);
  assert.equal(found.prefix, created.data.key.prefix);
  assert.equal(found.secret, undefined);
});

test("Agent policy lifecycle get and update", async () => {
  const policyRes = await settingsApi.getAgentPolicy("default");
  assert.ok(policyRes.data);
  assert.equal(policyRes.data.autonomy, "supervised");

  const ikey = createIdempotencyKey();
  const updated = await settingsApi.updateAgentPolicy(
    "default",
    { autonomy: "autonomous" },
    { idempotencyKey: ikey }
  );
  assert.equal(updated.data.autonomy, "autonomous");
});

test("Settings UI components render all 16 canonical sections without error", async () => {
  const { settingsControlPlanePage } = await import("../src/settings/pages/index.js");
  const { settingsSidebar, settingsHeader, settingRow, settingsModalContainer, SETTINGS_CATEGORIES } = await import("../src/settings/components/index.js");

  const canonicalSections = [
    "general", "ai-models", "agents", "memory", "tools",
    "connectors", "messaging", "vault", "developer", "automations",
    "usage", "security", "workspace", "appearance", "data", "advanced"
  ];

  // Verify all 16 sections exist in navigation categories
  const allNavSections = SETTINGS_CATEGORIES.flatMap((c) => c.sections.map((s) => s.id));
  for (const sec of canonicalSections) {
    assert.ok(allNavSections.includes(sec), `Section ${sec} missing from navigation`);
  }

  // Render each section through the master page
  for (const sec of canonicalSections) {
    const html = settingsControlPlanePage(sec);
    assert.ok(typeof html === "string");
    assert.ok(html.includes("settings-layout"), `Section ${sec} missing settings-layout`);
    assert.ok(html.includes("settings-sidebar"), `Section ${sec} missing settings-sidebar`);
    assert.ok(html.includes("settings-main"), `Section ${sec} missing settings-main`);
  }

  // Test settingRow variations
  const boolRow = settingRow(
    { id: "test.bool", value: true, sourceScope: "system", isOverridden: false, isLocked: false, schemaVersion: 1 },
    { id: "test.bool", section: "general", label: "Test Bool", description: "Desc", type: "boolean", default: true, allowedScopes: ["user"], sensitivity: "public", schemaVersion: 1 }
  );
  assert.ok(boolRow.includes("toggle-switch"));
  assert.ok(boolRow.includes("checked"));

  const lockedRow = settingRow(
    { id: "test.locked", value: "strict", sourceScope: "system", isOverridden: false, isLocked: true, lockReason: "System Policy", schemaVersion: 1 },
    { id: "test.locked", section: "general", label: "Locked", description: "Desc", type: "string", default: "strict", allowedScopes: ["user"], sensitivity: "public", schemaVersion: 1 }
  );
  assert.ok(lockedRow.includes("LOCKED"));
  assert.ok(lockedRow.includes("disabled"));

  // Test modals
  state.settingsActiveModal = { type: "create-api-key" };
  const createModalHtml = settingsModalContainer();
  assert.ok(createModalHtml.includes("Generate New API Key"));

  state.settingsActiveModal = {
    type: "api-key-revealed",
    data: { oneTimeSecret: "syn_live_test_secret_123", name: "Worker" }
  };
  const revealModalHtml = settingsModalContainer();
  assert.ok(revealModalHtml.includes("syn_live_test_secret_123"));
  assert.ok(revealModalHtml.includes("Invariant 19 Security Enforcement"));

  state.settingsActiveModal = null;
  assert.equal(settingsModalContainer(), "");
});
