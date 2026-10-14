// @ts-check
/**
 * SYNASE AI — Settings Domain Type Definitions
 */

export type Scope = 'system' | 'workspace' | 'project' | 'agent' | 'task' | 'session' | 'user';
export type Sensitivity = 'public' | 'internal' | 'sensitive' | 'secret';

export type SettingsSection =
  | 'general'
  | 'ai-models'
  | 'agents'
  | 'memory'
  | 'tools'
  | 'connectors'
  | 'messaging'
  | 'vault'
  | 'developer'
  | 'automations'
  | 'usage'
  | 'security'
  | 'workspace'
  | 'appearance'
  | 'data'
  | 'advanced';

export interface SettingDefinition<T = unknown> {
  id: string;
  section: SettingsSection;
  label: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'enum' | 'object' | 'list';
  default: T;
  allowedScopes: Scope[];
  sensitivity: Sensitivity;
  schemaVersion: number;
  options?: Array<{ label: string; value: string | number }>;
  permission?: string;
  resettable?: boolean;
}

export interface SettingValue<T = unknown> {
  definitionId: string;
  scope: Scope;
  scopeId: string;
  value: T;
  version: number;
  updatedAt: string;
  updatedBy: string;
}

export interface EffectiveSetting<T = unknown> {
  id: string;
  definition: SettingDefinition<T>;
  value: T;
  sourceScope: Scope;
  sourceId: string;
  isOverridden: boolean;
  constrainedByPolicy: boolean;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  status: 'active' | 'revoked';
}

export interface ConnectorItem {
  id: string;
  provider: string;
  name: string;
  kind: 'oauth' | 'api_key' | 'webhook';
  status: 'connected' | 'reauth_required' | 'disconnected';
  lastSyncAt: string | null;
  syncInterval: string;
  scopes: string[];
}

export interface AutomationItem {
  id: string;
  title: string;
  trigger: string;
  action: string;
  schedule: string;
  status: 'active' | 'paused';
  lastRunAt: string | null;
}

export interface AgentPolicy {
  autonomy: 'assist' | 'guided' | 'autonomous';
  confirmation: 'always' | 'sensitive_only' | 'never';
  toolRules: Array<{ toolId: string; effect: 'allow' | 'ask' | 'deny' }>;
  maxActionChain: number;
  allowExternalSideEffects: boolean;
}
