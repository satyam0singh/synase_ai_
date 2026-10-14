# Configuration Schemas

```ts
export type Scope = 'user' | 'workspace' | 'project' | 'agent' | 'task' | 'session';
export type Sensitivity = 'public' | 'internal' | 'sensitive' | 'secret';

export interface SettingDefinition<T = unknown> {
  id: string;
  label: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'enum' | 'object' | 'list';
  default: T;
  allowedScopes: Scope[];
  sensitivity: Sensitivity;
  schemaVersion: number;
  validation?: Record<string, unknown>;
  dependencies?: string[];
  permission: string;
  resettable: boolean;
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
  value: T;
  sourceScope: Scope;
  sourceId: string;
  definitionVersion: number;
  constrainedByPolicy: boolean;
}

export interface CredentialReference {
  id: string;
  provider: string;
  kind: 'oauth' | 'api_key' | 'token' | 'secret';
  status: 'active' | 'expired' | 'revoked' | 'reauth_required';
  createdAt: string;
  expiresAt?: string;
}

export interface AgentPolicy {
  autonomy: 'assist' | 'guided' | 'autonomous';
  confirmation: 'always' | 'sensitive_only' | 'never';
  toolRules: Array<{ toolId: string; effect: 'allow' | 'ask' | 'deny' }>;
  maxActionChain: number;
  allowExternalSideEffects: boolean;
}
```

## Versioning
Every persisted configuration object has `schemaVersion`. Migrations must be explicit and tested. Unknown future fields must be handled safely.
