# Project Structure — Product Intelligence Layer

## 1. Proposed repository changes

```text
src/
├── app/
│   ├── main.js                 # existing composition root; add Product actions/hydration here
│   ├── router.js               # add Product routes here
│   ├── shell.js                # update Product nav only if IA changes
│   └── paths.js                # add new Product paths if deep routes are adopted
│
├── product/
│   ├── api/
│   │   └── index.js
│   ├── components/
│   │   ├── intelligenceHeader.js
│   │   ├── provenanceBadge.js
│   │   ├── requirementTable.js
│   │   ├── requirementDetail.js
│   │   ├── prioritizationBoard.js
│   │   ├── strategyPanel.js
│   │   ├── roadmap.js
│   │   ├── decisionTrace.js
│   │   └── emptyStates.js
│   ├── pages/
│   │   ├── index.js
│   │   ├── overview.js
│   │   ├── requirements.js
│   │   ├── prioritization.js
│   │   ├── strategy.js
│   │   ├── roadmap.js
│   │   └── decisions.js
│   └── types.d.ts
│
├── shared/
│   ├── api/                    # existing; add Product mock/live methods here
│   ├── components/             # reuse ui.js helpers
│   ├── state/                  # existing plain-object store
│   ├── services/
│   ├── utils/
│   └── types/                  # add Product domain types
│
└── styles/
    └── product/
        └── product.css

test/
├── product-api.test.mjs
├── product-pages.test.mjs
└── product-contract.test.mjs

brain/
└── product/
    ├── nodes.schema.json
    ├── edges.schema.json
    ├── taxonomy.json
    ├── fixtures.json
    ├── invariants.md
    └── README.md

docs/
└── product/
    ├── PRD.md
    ├── BRD.md
    ├── BRAIN.md
    ├── ARCHITECTURE.md
    ├── API_CONTRACT.md
    └── IMPLEMENTATION_PLAN.md
```

## 2. File ownership matrix

| File | Owner responsibility |
|---|---|
| `app/main.js` | Product hydration + event/action orchestration |
| `app/router.js` | Route registration |
| `app/shell.js` | Sidebar / navigation |
| `product/pages/*` | Page composition and markup |
| `product/components/*` | Reusable Product UI templates |
| `product/api/index.js` | Domain API facade |
| `shared/api/mock.js` | Deterministic Product backend simulation |
| `shared/api/live.js` | Live transport mirror |
| `shared/types/types.d.ts` | Shared Product types |
| `styles/product/product.css` | Product-specific styling |
| `test/*product*` | Contract and interaction tests |
| `brain/product/*` | Knowledge-graph schema + fixtures |

## 3. Naming rules

- lower camelCase for JavaScript modules.
- one dominant responsibility per file.
- components return HTML strings.
- no framework components.
- no direct DOM mutation from Product modules.
- no domain-to-domain imports.

## 4. Migration strategy from current `src/product/pages/index.js`

Do not rewrite all Product functionality at once.

### Step A
Extract the existing four views unchanged into dedicated files.

### Step B
Introduce shared Product components for repeated cards, provenance, tables and section headers.

### Step C
Add new state fields and route handling incrementally.

### Step D
Move or add API methods one at a time and retain current mock fixtures until tests pass.

### Step E
Only after parity, remove obsolete code from the monolithic Product page.

## 5. Do not do

- Do not introduce React/Next/Vue into this layer.
- Do not create a second router.
- Do not place API calls in views.
- Do not add component-local event listeners.
- Do not bypass `escapeHtml`.
- Do not use raw colors in CSS.
