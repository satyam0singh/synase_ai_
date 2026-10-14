# Project Structure — SYNASE AI Settings

```text
synase/
├── apps/
│   ├── web/
│   │   └── src/
│   │       ├── app/settings/
│   │       │   ├── layout/
│   │       │   ├── routes/
│   │       │   ├── pages/
│   │       │   └── registry/
│   │       ├── components/settings/
│   │       └── lib/settings/
│   └── api/
│       └── src/modules/
│           ├── settings/
│           ├── policy/
│           ├── providers/
│           ├── agents/
│           ├── tools/
│           ├── connectors/
│           ├── credentials/
│           ├── messaging/
│           ├── vault/
│           ├── automations/
│           ├── usage/
│           ├── audit/
│           └── data-transfer/
├── packages/
│   ├── ui/
│   ├── types/
│   ├── config/
│   ├── auth/
│   ├── ai/
│   ├── agents/
│   ├── tools/
│   ├── connectors/
│   ├── messaging/
│   ├── vault/
│   ├── automations/
│   ├── usage/
│   ├── audit/
│   ├── security/
│   ├── db/
│   └── import-export/
├── brain/
│   └── settings/
│       ├── taxonomy.md
│       ├── scopes.md
│       ├── policies.md
│       └── invariants.md
├── docs/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── scripts/
```

## Dependency direction
UI → domain client → typed API contract → backend domain modules → infrastructure adapters.

Infrastructure must not import UI. Domain packages must not depend on concrete provider SDKs unless behind adapters.

## Naming
- React components: PascalCase.
- Hooks: `useX`.
- API methods: domain-oriented verbs.
- IDs: opaque strings/UUIDs.
- Settings IDs: `domain.setting_name`.
- Policy IDs: `policy.*`.
