// @ts-check
/* Settings Control Plane API surface.
   A named subset of the shared adapter. Domain code imports this rather than
   the whole `api` object so the boundary is explicit and testable. */

import { api, createIdempotencyKey } from "../../shared/api/index.js";
import { settingsRegistry } from "../../shared/api/settingsEngine.js";

/**
 * Creates a settings API client bound to an adapter.
 * @param {typeof api} [adapter]
 */
export function createSettingsApi(adapter = api) {
  return {
    getEffectiveSettings: (section, context) => {
      if (typeof section === "object" && section !== null) {
        return adapter.getEffectiveSettings(undefined, section);
      }
      return adapter.getEffectiveSettings(section, context);
    },
    getSettingDefinitions: (section) => adapter.getSettingDefinitions(section),
    updateSetting: (settingId, payload, options) => {
      if (typeof settingId === "object" && settingId !== null) {
        const { id, idempotencyKey, ...rest } = settingId;
        const opts = idempotencyKey ? { idempotencyKey } : options;
        return adapter.updateSetting(id, rest, opts);
      }
      return adapter.updateSetting(settingId, payload, options);
    },
    resetSettings: (settingIds, options = {}) => {
      let ids = settingIds;
      let ikey = options?.idempotencyKey || createIdempotencyKey();
      if (typeof settingIds === "object" && !Array.isArray(settingIds) && settingIds !== null) {
        if (settingIds.idempotencyKey) ikey = settingIds.idempotencyKey;
        if (settingIds.section) {
          ids = settingsRegistry.filter((d) => d.section === settingIds.section).map((d) => d.id);
        } else if (settingIds.settingIds) {
          ids = settingIds.settingIds;
        } else {
          ids = undefined;
        }
      }
      return adapter.resetSettings(ids, { idempotencyKey: ikey });
    },

    listProviders: () => adapter.listProviders(),
    getAgentPolicy: (agentId) => adapter.getAgentPolicy(agentId),
    updateAgentPolicy: (agentId, patch, options) => adapter.updateAgentPolicy(agentId, patch, options),

    listApiKeys: () => adapter.listApiKeys(),
    createApiKey: (payload, options) => adapter.createApiKey(payload, options),
    revokeApiKey: (keyId, options) => adapter.revokeApiKey(keyId, options),

    listConnectors: () => adapter.listConnectors(),
    updateConnector: (connectorId, patch, options) => adapter.updateConnector(connectorId, patch, options),

    listAutomations: () => adapter.listAutomations(),
    updateAutomation: (id, patch, options) => adapter.updateAutomation(id, patch, options),

    getUsageSummary: () => adapter.getUsageSummary(),
    exportWorkspaceData: (options = {}, opts = {}) => {
      if (typeof options === "string") {
        const payload = typeof opts === "object" ? opts : { workspaceId: options };
        return adapter.exportWorkspaceData(payload, { idempotencyKey: payload.idempotencyKey || opts?.idempotencyKey || createIdempotencyKey() });
      }
      const idempotencyKey = options?.idempotencyKey || opts?.idempotencyKey || createIdempotencyKey();
      return adapter.exportWorkspaceData(options, { idempotencyKey });
    },
    validateImportData: (payload) => adapter.validateImportData(payload)
  };
}

export const settingsApi = createSettingsApi(api);
