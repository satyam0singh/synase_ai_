# Implementation Plan — Product Intelligence Revamp

## Phase 0 — Source reconciliation

1. Import the Google Doc into local text/Markdown.
2. Extract headings, requirements, workflows, field definitions, screens, API rules and acceptance criteria.
3. Build a traceability matrix from source requirement -> PRD -> UI -> API -> state -> test.
4. Resolve conflicts with the existing Synase handoff explicitly.

## Phase 1 — Domain skeleton

Create the Product folder structure without changing behavior.

Deliverables:
- split page files;
- components folder;
- Product API facade retained;
- types isolated.

Gate: existing Product UI still renders.

## Phase 2 — Information architecture

Implement route/page composition.

Deliverables:
- Product overview;
- requirements route;
- prioritization route;
- strategy route;
- roadmap route;
- decisions route if required.

Gate: one-router and one-listener architecture preserved.

## Phase 3 — UI system

Build reusable Product components:
- section header;
- metric cards;
- filter controls;
- requirement table;
- score comparison;
- strategy cards;
- roadmap timeline/list;
- provenance badge;
- decision trace.

Gate: no raw color literals, square shape language, dark theme correct.

## Phase 4 — State + API

1. Extend shared state.
2. Add/mock fixture data.
3. Implement facade methods.
4. Mirror methods in live adapter.
5. Add loading/error/empty behavior.

Gate: every view is state-driven.

## Phase 5 — Product Brain

Add:
- schemas;
- fixture graph;
- Product node types;
- Product edge types;
- invariants;
- trace queries.

Gate: `npm run brain` remains deterministic.

## Phase 6 — Safety / provenance

Verify:
- confirmed vs suggested visuals;
- approval is not execution;
- redaction rules;
- idempotency replay behavior;
- mock disclosure.

## Phase 7 — Verification

Run:

```bash
npm test
npm run build
npm run brain
npm run dev
```

Manual checks:
- light theme;
- dark theme;
- navigation/deep links;
- empty states;
- API failures;
- long titles and evidence;
- keyboard navigation;
- provenance clarity.

## Phase 8 — Documentation + ship

Update:
- `ARCHITECTURE.md` Product section;
- `README.md`;
- `ALL_APIs.TXT`;
- Product docs;
- brain docs.

Then commit and push to `main`.

## Definition of done

A Product Layer change is done only when:

- behavior is fully state-driven;
- Product domain is isolated;
- API facade + mock + live + types are synchronized;
- tests pass;
- build passes;
- brain regenerates;
- provenance is unambiguous;
- documentation matches implementation.
