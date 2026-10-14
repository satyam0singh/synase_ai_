# Product Brain Invariants

1. Product nodes are project-scoped unless explicitly global.
2. Generated nodes retain `provenance=ai_suggested` until confirmation.
3. Decisions retain evidence links.
4. Roadmap dependency graph is acyclic for confirmed state.
5. Identical inputs produce identical priority ranking in mock mode.
6. Brain generation is reproducible from its source fixtures.
